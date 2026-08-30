import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateRecoveryMetrics } from '@/lib/ai/recovery-metrics-agent'
import { recoveryMetricsInputSchema, recoveryMetricsOutputSchema } from '@/lib/ai/recovery-metrics-schema'

export async function POST(request) {
  try {
    const input = recoveryMetricsInputSchema.parse(await request.json())
    const process = await prisma.process.findUnique({ where: { id: input.processId } })
    if (!process) return NextResponse.json({ error: { code: 'RECOVERY_METRICS_PROCESS_NOT_FOUND', message: 'Processus introuvable' } }, { status: 404 })
    const reports = await prisma.biaReport.findMany({ where: { includedProcessIds: { has: process.id } }, orderBy: { createdAt: 'desc' }, take: 3 })
    const result = await calculateRecoveryMetrics({ process: { ...process, id: process.id }, biaReports: reports.map((r) => r.reportData || {}), context: { currentDate: new Date().toISOString().slice(0, 10) }, mode: input.mode, clarifications: input.clarifications })
    const checked = recoveryMetricsOutputSchema.parse(result)
    return NextResponse.json({ data: checked })
  } catch (error) {
    const code = error?.code || (error?.name === 'ZodError' ? 'RECOVERY_METRICS_INPUT_ERROR' : 'RECOVERY_METRICS_INTERNAL_ERROR')
    const status = code.includes('NOT_FOUND') ? 404 : code.includes('TIMEOUT') ? 504 : code.includes('INPUT') ? 400 : 502
    return NextResponse.json({ error: { code, message: error.message || 'Calcul impossible', retryable: status >= 500 } }, { status })
  }
}
