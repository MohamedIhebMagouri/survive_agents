import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reportView, systemUserId } from '@/lib/bia-backend'
import { randomUUID } from 'node:crypto'
import { validateBia } from '@/lib/ai/bia-validator'
export async function GET() { const rows = await prisma.biaReport.findMany({ orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data: rows.map(reportView) }) }
function integerOr(value, fallback) {
  const match = String(value ?? '').match(/-?\d+(?:[.,]\d+)?/)
  const parsed = match ? Number(match[0].replace(',', '.')) : NaN
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback
}
export async function POST(request) { try {
  const body = await request.json()
  if (!body.processId) return NextResponse.json({ error: 'Processus requis' }, { status: 400 })
  const validation = validateBia(body)
  if (!validation.valid) return NextResponse.json({ error: { code: 'BIA_VALIDATION_ERROR', message: 'Les données BIA contiennent des incohérences.', details: validation }, }, { status: 422 })
  const mbcoValue = Number.parseInt(String(body.mbco ?? 50).replace('%', ''), 10)
  const recommendations = Array.isArray(body.recommendations) ? body.recommendations : []
  const aiRecommendations = body.aiRecommendations && typeof body.aiRecommendations === 'object' ? body.aiRecommendations : null
  const persistedRecommendations = recommendations.length ? recommendations : (Array.isArray(aiRecommendations?.recommendations) ? aiRecommendations.recommendations.map((item) => ({ ...item, text: item.text || item.title || item.description || '' })) : [])
  const rto = Math.max(1, integerOr(body.rto, 24))
  const rpo = Math.max(0, Math.min(rto, integerOr(body.rpo, 4)))
  const mtpd = Math.max(rto, integerOr(body.mtpd, 72))
  const processMetrics = { rto, rpo, mtpd, mbco: `${Number.isFinite(mbcoValue) ? Math.max(0, Math.min(100, mbcoValue)) : 50}%` }
  const row = await prisma.$transaction(async (tx) => {
    await tx.process.update({ where: { id: body.processId }, data: processMetrics })
    return tx.biaReport.create({ data: { name: `BIA ${body.processName || body.processId}`, description: body.objective || null, format: 'JSON', status: 'GENERATED', totalProcesses: 1, continuityLevel: Math.max(0, integerOr(body.globalScore, 0)), recommendationCount: persistedRecommendations.length, reportData: { ...body, recommendations: persistedRecommendations, aiRecommendations, rto: processMetrics.rto, rpo: processMetrics.rpo, mtpd: processMetrics.mtpd, mbco: processMetrics.mbco }, includedProcessIds: [body.processId], factoryId: body.factoryId || null, authorId: await systemUserId(), shareToken: randomUUID() } })
  })
  return NextResponse.json({ data: { ...reportView(row), validation } }, { status: 201 })
} catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) } }
