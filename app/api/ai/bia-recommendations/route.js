import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { biaRecommendationsInputSchema, biaRecommendationsOutputSchema } from '@/lib/ai/bia-recommendations-schema'
import { generateBiaRecommendations } from '@/lib/ai/bia-recommendations-agent'
import { processView, factoryView, strategyView } from '@/lib/bia-backend'

export async function POST(request) {
  try {
    const input = biaRecommendationsInputSchema.parse(await request.json())
    const process = await prisma.process.findUnique({ where: { id: input.bia.processId } })
    if (!process) return NextResponse.json({ error: { code: 'BIA_RECOMMENDATIONS_PROCESS_NOT_FOUND', message: 'Processus introuvable' } }, { status: 404 })
    const [factory, strategies, reports] = await Promise.all([
      process.factoryId ? prisma.factory.findUnique({ where: { id: process.factoryId } }) : null,
      prisma.continuityStrategy.findMany({ where: { processId: process.id }, orderBy: { createdAt: 'desc' } }),
      prisma.biaReport.findMany({ where: { includedProcessIds: { has: process.id } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ])
    const result = await generateBiaRecommendations({ ...input, context: { process: processView(process), factory: factory ? factoryView(factory) : null, existingStrategies: strategies.map(strategyView), previousReports: reports.map((report) => report.reportData || {}) } })
    const checked = biaRecommendationsOutputSchema.parse(result)
    return NextResponse.json({ data: checked })
  } catch (error) {
    const code = error?.code || (error?.name === 'ZodError' ? 'BIA_RECOMMENDATIONS_INPUT_ERROR' : 'BIA_RECOMMENDATIONS_INTERNAL_ERROR')
    const status = code.includes('NOT_FOUND') ? 404 : code.includes('INPUT') ? 400 : code.includes('TIMEOUT') ? 504 : 502
    return NextResponse.json({ error: { code, message: error.message || 'Génération impossible', retryable: status >= 500 } }, { status })
  }
}
