import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBiaPdf } from '@/lib/bia-pdf'
import { analysisFromProcess, parseAnalysisBuffer, parseAnalysisJson } from '@/lib/bia/readAnalysis'

export const runtime = 'nodejs'

const fileName = value => `rapport-bia-${String(value || 'processus').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.pdf`

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let analysis; let process; let factory; let reportName = 'processus'; let config = {}
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file')
      if (!(file instanceof File)) return NextResponse.json({ error: 'Fichier JSON ou XLSX requis.' }, { status: 400 })
      const result = parseAnalysisBuffer(Buffer.from(await file.arrayBuffer()), file.name)
      analysis = result.analysis; reportName = analysis.process?.name || file.name
    } else {
      const body = await request.json()
      config = body.config || {}
      if (body.source) {
        const result = parseAnalysisJson(body.source)
        analysis = result.analysis; reportName = analysis.process?.name || reportName
      } else {
        const reportId = body.reportId
        const processId = body.processId || (reportId ? (await prisma.biaReport.findUnique({ where: { id: reportId }, select: { includedProcessIds: true } }))?.includedProcessIds?.[0] : null)
        if (!processId) return NextResponse.json({ error: 'reportId, processId ou source JSON requis.' }, { status: 400 })
        process = await prisma.process.findUnique({ where: { id: processId }, include: { factory: true } })
        if (!process) return NextResponse.json({ error: 'Processus BIA introuvable.' }, { status: 404 })
        factory = process.factory
        const report = reportId ? await prisma.biaReport.findUnique({ where: { id: reportId }, select: { id: true, reportData: true, createdAt: true } }) : null
        const result = analysisFromProcess(process, (report?.reportData || {}) as Record<string, unknown>, factory)
        analysis = result.analysis; reportName = process.name
      }
    }
    const pdf = await createBiaPdf({ bia: null, analysis, process, factory, config })
    const downloadName = fileName(reportName)
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${downloadName}"`, 'Content-Length': String(pdf.length), 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Source BIA invalide.' }, { status: 400 })
  }
}
