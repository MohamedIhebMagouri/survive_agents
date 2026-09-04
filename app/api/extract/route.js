import { NextResponse } from 'next/server'
import { detectDocumentType, extractFromPdf, extractFromDocx, extractFromXlsx } from '@/lib/extractors'
import { callGeminiExtraction } from '@/lib/extractors/gemini'
import { prisma } from '@/lib/prisma'
import { factoryView } from '@/lib/bia-backend'

export const runtime = 'nodejs'

function errorResponse(code, message, status, retryable = false) {
  return NextResponse.json({ error: { code, message, retryable } }, { status })
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const factoryId = String(formData.get('factoryId') || '').trim()
    if (!factoryId) return errorResponse('FACTORY_REQUIRED', 'Sélectionnez une usine avant l’extraction.', 400)
    const factory = await prisma.factory.findUnique({ where: { id: factoryId } })
    if (!factory) return errorResponse('FACTORY_NOT_FOUND', 'L’usine sélectionnée est introuvable.', 400)
    const { extension, mimeType } = detectDocumentType(file)
    const content = extension === 'pdf' ? await extractFromPdf(file, mimeType) : extension === 'docx' ? await extractFromDocx(file) : await extractFromXlsx(file)
    const fields = await callGeminiExtraction(content, factoryView(factory))
    return NextResponse.json({ data: { fields, fileName: file.name, format: extension } })
  } catch (error) {
    if (['DOCUMENT_REQUIRED', 'DOCUMENT_TOO_LARGE', 'DOCUMENT_UNSUPPORTED', 'DOCUMENT_EMPTY', 'DOCUMENT_INVALID'].includes(error?.code)) {
      return errorResponse(error.code, error.message, 400)
    }
    if (error?.code === 'GEMINI_CONFIG_ERROR') return errorResponse(error.code, 'La clé Gemini est absente de la configuration serveur.', 503)
    if (error?.code === 'GEMINI_OUTPUT_ERROR') return errorResponse(error.code, 'Gemini a renvoyé une réponse inexploitable. Réessayez.', 502, true)
    return errorResponse('GEMINI_PROVIDER_ERROR', 'Le service Gemini est temporairement indisponible. Réessayez.', 502, true)
  }
}
