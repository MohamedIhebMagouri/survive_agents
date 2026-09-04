import { NextResponse } from 'next/server'
import { processCaptureInputSchema } from '@/lib/ai/process-capture-schema'
import { captureProcess } from '@/lib/ai/process-capture-agent'
import { prisma } from '@/lib/prisma'
import { factoryView, processView } from '@/lib/bia-backend'
import { calculateRecoveryMetrics } from '@/lib/ai/recovery-metrics-agent'
import { recoveryMetricsOutputSchema } from '@/lib/ai/recovery-metrics-schema'
import { extractDocumentText } from '@/lib/document-text-extractor'

function errorResponse(code, message, status, retryable = false, details = []) {
  return NextResponse.json({ error: { code, message, details, retryable } }, { status })
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let rawInput
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      const description = String(formData.get('text') || '').trim()
      const document = file && typeof file.arrayBuffer === 'function' ? await extractDocumentText(file) : null
      const combinedText = document
        ? (description ? `${description}\n\nContenu du document « ${document.fileName} » :\n${document.text}` : document.text)
        : description
      rawInput = {
        mode: document ? 'document' : 'free_text',
        text: combinedText.slice(0, 12000),
        formData: parseFormData(formData.get('formData')),
        document: document ? { fileName: document.fileName, extension: document.extension, truncated: document.truncated } : null,
      }
    } else {
      rawInput = await request.json()
    }
    const input = processCaptureInputSchema.parse(rawInput)
    const [factoryRows, processRows] = await Promise.all([
      prisma.factory.findMany({ orderBy: { name: 'asc' } }),
      prisma.process.findMany({ orderBy: { name: 'asc' } }),
    ])
    const result = await captureProcess(input, { factories: factoryRows.map(factoryView), processes: processRows.map(processView) })
    let recoveryMetrics = null
    if (result.process?.name && result.process?.criticality) {
      try {
        recoveryMetrics = recoveryMetricsOutputSchema.parse(await calculateRecoveryMetrics({
          process: { ...result.process, id: 'draft-process' },
          biaReports: [],
          context: { factories: factoryRows.map(factoryView), currentDate: new Date().toISOString().slice(0, 10) },
          mode: 'calculate',
          clarifications: [],
        }))
      } catch (recoveryError) {
        result.warnings = [...(result.warnings || []), `La suggestion des objectifs de récupération est indisponible : ${recoveryError.message}`]
      }
    }
    return NextResponse.json({ data: { ...result, recoveryMetrics } }, { status: result.status === 'error' ? 422 : 200 })
  } catch (error) {
    if (['DOCUMENT_REQUIRED', 'DOCUMENT_TOO_LARGE', 'DOCUMENT_UNSUPPORTED', 'DOCUMENT_EMPTY', 'DOCUMENT_INVALID'].includes(error?.code)) return errorResponse(error.code, error.message, 400, false)
    if (error?.code === 'PROCESS_CAPTURE_INPUT_ERROR') return errorResponse(error.code, error.message, 400, false)
    if (error?.code === 'GEMINI_OUTPUT_ERROR') return errorResponse(error.code, 'Le service de capture a renvoyé une réponse inexploitable. Réessayez.', 502, true)
    if (error?.name === 'ZodError') return errorResponse('PROCESS_CAPTURE_INPUT_ERROR', 'Les données de capture sont invalides.', 400, false, error.issues)
    if (error?.code === 'GEMINI_CONFIG_ERROR') return errorResponse(error.code, 'La capture IA est indisponible. Continuez avec la saisie manuelle.', 503, false)
    if (error?.code === 'GEMINI_TIMEOUT') return errorResponse(error.code, 'Le service de capture a dépassé le délai autorisé.', 504, true)
    if (error?.code === 'GEMINI_PROVIDER_ERROR') return errorResponse(error.code, 'Le service de capture est temporairement indisponible.', 502, true)
    return errorResponse('PROCESS_CAPTURE_INTERNAL_ERROR', 'Une erreur interne est survenue.', 500, false)
  }
}

function parseFormData(value) {
  try {
    const parsed = JSON.parse(String(value || '{}'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid form data')
    return parsed
  } catch {
    const error = new Error('Les données du formulaire sont invalides.')
    error.code = 'PROCESS_CAPTURE_INPUT_ERROR'
    throw error
  }
}
