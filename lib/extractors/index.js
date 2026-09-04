import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024

const MIME_BY_EXTENSION = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const SUPPORTED_EXTENSIONS = new Set(Object.keys(MIME_BY_EXTENSION))

function extensionOf(fileName) {
  return String(fileName || '').toLowerCase().split('.').pop()
}

function documentError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

export function detectDocumentType(file) {
  if (!file || typeof file.arrayBuffer !== 'function') throw documentError('DOCUMENT_REQUIRED', 'Aucun document n’a été fourni.')
  if (file.size > MAX_DOCUMENT_BYTES) throw documentError('DOCUMENT_TOO_LARGE', 'Le document ne doit pas dépasser 15 Mo.')
  const extension = extensionOf(file.name)
  const mimeType = file.type || MIME_BY_EXTENSION[extension]
  if (!SUPPORTED_EXTENSIONS.has(extension) || (file.type && file.type !== MIME_BY_EXTENSION[extension])) {
    throw documentError('DOCUMENT_UNSUPPORTED', 'Format non pris en charge. Utilisez uniquement PDF, DOCX ou XLSX.')
  }
  return { extension, mimeType }
}

function normalizeText(value) {
  return String(value || '').replace(/\u0000/g, '').replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

export async function extractFromPdf(file, mimeType) {
  return { kind: 'inlineData', mimeType, data: Buffer.from(await file.arrayBuffer()).toString('base64') }
}

export async function extractFromDocx(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const parsed = await mammoth.extractRawText({ buffer })
  const text = normalizeText(parsed.value)
  if (!text) throw documentError('DOCUMENT_EMPTY', 'Le document DOCX ne contient aucun texte exploitable.')
  return text
}

export async function extractFromXlsx(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const text = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    return `Feuille: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`
  }).join('\n\n')
  const normalized = normalizeText(text).slice(0, 100000)
  if (!normalized) throw documentError('DOCUMENT_EMPTY', 'Le document XLSX ne contient aucune donnée exploitable.')
  return normalized
}

export async function extractDocument(file) {
  const { extension, mimeType } = detectDocumentType(file)
  try {
    const content = extension === 'pdf'
      ? await extractFromPdf(file, mimeType)
      : extension === 'docx' ? await extractFromDocx(file) : await extractFromXlsx(file)
    return { extension, mimeType, content }
  } catch (error) {
    if (error.code) throw error
    throw documentError('DOCUMENT_INVALID', `Le document ${file.name} est illisible ou corrompu.`)
  }
}
