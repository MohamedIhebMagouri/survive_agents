import { prisma } from '@/lib/prisma'
import { processView, reportView } from '@/lib/bia-backend'
import { buildLatexSource, generateBiaPdfReport } from '@/lib/ai/bia-pdf-report-agent'
import { renderBiaReportPdf, resolveReportBrand } from '@/lib/pdf/bia-report-pdf'

export const runtime = 'nodejs'

export const maxDuration = 60
export async function POST(_, { params }) {
  const { id } = await params
  const row = await prisma.biaReport.findUnique({ where: { id } })
  if (!row) return new Response('BIA introuvable', { status: 404 })

  const bia = reportView(row)
  const process = await prisma.process.findUnique({ where: { id: bia.processId }, include: { factory: true } })
  if (!process) return NextResponse.json({ error: { code: 'PROCESS_NOT_FOUND', message: 'Processus associé introuvable.' } }, { status: 404 })
  const processData = processView(process)
  const factory = process.factory
  const context = { bia, process: processData, factory, reference: `BIA-${String(row.id).slice(-8).toUpperCase()}` }
  const brand = resolveReportBrand(factory)
  const generated = await generateBiaPdfReport(context)
  const latexSource = buildLatexSource(generated, context, brand)
  const pdf = await renderBiaReportPdf(generated, context, brand)
  const fileName = `${String(process.name || id).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}-rapport-bia.pdf`

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': 'no-store',
      'X-BIA-Generated-By': 'Gemini',
      'X-BIA-Latex-Bytes': String(Buffer.byteLength(latexSource, 'utf8')),
      'X-BIA-Layout-Pages': '30',
    },
  })
}
