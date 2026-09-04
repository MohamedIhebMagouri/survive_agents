import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processView, reportView } from '@/lib/bia-backend'
import { buildLatexSource, generateBiaPdfReport } from '@/lib/ai/bia-pdf-report-agent'
import { renderBiaReportPdf, resolveReportBrand } from '@/lib/pdf/bia-report-pdf'

export const runtime = 'nodejs'
export const maxDuration = 60

function safeFilename(value) {
  return String(value || 'rapport-bia').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
}

export async function POST(_, { params }) {
  try {
    const { id } = await params
    const row = await prisma.biaReport.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: { code: 'BIA_NOT_FOUND', message: 'Analyse BIA introuvable.' } }, { status: 404 })

    const bia = reportView(row)
    const processRow = await prisma.process.findUnique({ where: { id: bia.processId }, include: { factory: true } })
    if (!processRow) return NextResponse.json({ error: { code: 'PROCESS_NOT_FOUND', message: 'Processus associé introuvable.' } }, { status: 404 })

    const process = processView(processRow)
    const factory = processRow.factory
    const reference = `BIA-${String(row.id).slice(-8).toUpperCase()}`
    const context = { bia, process, factory, reference }
    const brand = resolveReportBrand(factory)
    const generated = await generateBiaPdfReport(context)
    const latexSource = buildLatexSource(generated, context, brand)
    const pdf = await renderBiaReportPdf(generated, context, brand)
    const filename = `${safeFilename(process.name)}-rapport-bia.pdf`

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-BIA-Generated-By': 'Gemini',
        'X-BIA-Latex-Bytes': String(Buffer.byteLength(latexSource, 'utf8')),
        'X-BIA-Layout-Pages': '30',
      },
    })
  } catch (error) {
    const code = error?.code || 'BIA_PDF_GENERATION_ERROR'
    const status = code === 'GEMINI_NOT_CONFIGURED' ? 503 : code === 'GEMINI_REPORT_GENERATION_ERROR' ? 502 : 500
    return NextResponse.json({ error: { code, message: error?.message || 'Impossible de générer le rapport PDF.', retryable: status >= 500 && code !== 'GEMINI_NOT_CONFIGURED' } }, { status })
  }
}
