import BiaDetailView from '@/components/bia/BiaDetailView'
import { prisma } from '@/lib/prisma'
import { processView, reportView } from '@/lib/bia-backend'
import { notFound } from 'next/navigation'

export default async function BiaDetailPage({ params }) {
  const { id } = await params
  const row = await prisma.biaReport.findUnique({ where: { id } })
  if (!row) notFound()
  const bia = reportView(row)
  const processRow = await prisma.process.findUnique({ where: { id: bia.processId }, include: { factory: { include: { manager: true } } } })
  const process = processRow ? { ...processView(processRow), factory: processRow.factory ? { id: processRow.factory.id, name: processRow.factory.name } : null } : null

  return <BiaDetailView bia={bia} process={process} />
}
