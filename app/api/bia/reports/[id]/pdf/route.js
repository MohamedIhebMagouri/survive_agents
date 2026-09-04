import { prisma } from '@/lib/prisma'
import { reportView } from '@/lib/bia-backend'
import { createBiaPdf } from '@/lib/bia-pdf'
import { analysisFromProcess } from '@/lib/bia/readAnalysis'

export const runtime = 'nodejs'

export async function GET(_, { params }) {
  const { id } = await params
  const row = await prisma.biaReport.findUnique({ where: { id } })
  if (!row) return new Response('BIA introuvable', { status: 404 })

  const processId = row.includedProcessIds?.[0]
  const process = processId
    ? await prisma.process.findUnique({ where: { id: processId }, include: { factory: true } })
    : null
  const bia = reportView(row)
  const normalized = analysisFromProcess(process || {}, (row.reportData || {}), process?.factory)
  const pdf = await createBiaPdf({
    bia,
    process,
    factory: process?.factory,
    analysis: normalized.analysis,
  })
  const fileName = `rapport-bia-${(process?.name || id).toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.pdf`

  await prisma.biaReport.update({
    where: { id },
    data: {
      format: 'PDF',
      content: pdf.toString('base64'),
      fileName,
      fileSize: pdf.length,
      mimeType: 'application/pdf',
      downloadCount: { increment: 1 },
    },
  })

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(pdf.length),
      'Cache-Control': 'no-store',
    },
  })
}
