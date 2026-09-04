import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
const SUPPORTED_EXTENSIONS = new Set(['pdf', 'docx', 'xls', 'xlsx'])

function extensionOf(name) {
  return String(name || '').toLowerCase().split('.').pop()
}

function normalizeText(value) {
  return String(value || '').replace(/\u0000/g, '').replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

async function extractDocxXmlText(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const parts = Object.keys(zip.files).filter((name) => /^word\/(document|header\d+|footer\d+|footnotes|endnotes|comments)\.xml$/i.test(name))
  const chunks = []
  for (const name of parts) {
    const xml = await zip.files[name].async('string')
    const text = xml.replace(/<w:tab\s*\/?>(?:<\/w:tab>)?/gi, '\t').replace(/<w:br\s*\/?>(?:<\/w:br>)?/gi, '\n').replace(/<\/w:p>/gi, '\n').replace(/<\/w:tr>/gi, '\n').replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi, '$1').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    if (text.trim()) chunks.push(`[${name}]\n${text}`)
  }
  return chunks.join('\n\n')
}

export async function extractDocumentText(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    const error = new Error('Aucun document n’a été fourni.')
    error.code = 'DOCUMENT_REQUIRED'
    throw error
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    const error = new Error('Le document ne doit pas dépasser 10 Mo.')
    error.code = 'DOCUMENT_TOO_LARGE'
    throw error
  }
  const extension = extensionOf(file.name)
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    const error = new Error('Format non pris en charge. Utilisez PDF, DOCX, XLS ou XLSX.')
    error.code = 'DOCUMENT_UNSUPPORTED'
    throw error
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let text
  try {
    if (extension === 'pdf') {
      const parsed = await pdfParse(buffer)
      text = parsed.text
    } else if (extension === 'docx') {
      const parsed = await mammoth.extractRawText({ buffer })
      text = [parsed.value, await extractDocxXmlText(buffer)].filter(Boolean).join('\n\n')
      if (!text || text.trim().length < 80) {
        const html = await mammoth.convertToHtml({ buffer })
        text = String(html.value || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>|<\/tr>|<\/li>|<\/h[1-6]>/gi, '\n').replace(/<\/td>/gi, ' | ').replace(/<[^>]+>/g, ' ')
      }
    } else {
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
      text = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName]
        return `Feuille: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`
      }).join('\n\n')
    }
  } catch (parseError) {
    const error = new Error(`Le document ${file.name} est illisible ou corrompu.`)
    error.code = 'DOCUMENT_INVALID'
    error.cause = parseError
    throw error
  }

  const normalized = normalizeText(text)
  if (!normalized) {
    const error = new Error('Le document ne contient aucun texte exploitable.')
    error.code = 'DOCUMENT_EMPTY'
    throw error
  }
  const maxText = 120000
  return { text: normalized.slice(0, maxText), fileName: file.name, extension, truncated: normalized.length > maxText }
}
