import { GoogleGenAI } from '@google/genai'
import { extractedFieldsSchema, extractionResponseSchema } from './extraction-schema'

const instructions = `Extrais les champs du document dans la structure JSON demandée. Réponds uniquement en JSON valide et en français pour les valeurs textuelles. Utilise null lorsqu’un champ est absent. N’invente aucune information. Convertis les durées RTO, RPO et MTPD en heures entières et MBCO en pourcentage entier. Les catégories autorisées sont Support, Coeur de métier, Pilotage; les criticités sont Mineur, Modéré, Majeur, Critique; le statut est Actif ou Inactif.`

export async function callGeminiExtraction(content, factory = null) {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured')
    error.code = 'GEMINI_CONFIG_ERROR'
    throw error
  }
  const ai = new GoogleGenAI({ apiKey })
  const factoryContext = factory ? `\n\nUsine sélectionnée par l’utilisateur (source fiable, ne pas modifier) : ${JSON.stringify(factory)}` : ''
  const contents = content.kind === 'inlineData'
    ? [{ inlineData: { mimeType: content.mimeType, data: content.data } }, { text: `${instructions}${factoryContext}` }]
    : [{ text: `${instructions}${factoryContext}\n\nContenu extrait du document :\n${content}` }]
  let lastError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents,
        config: { responseMimeType: 'application/json', responseSchema: extractionResponseSchema, temperature: 0.1 },
      })
      return extractedFieldsSchema.parse(JSON.parse(response.text || ''))
    } catch (error) {
      lastError = error
      if (error.name === 'ZodError' || error instanceof SyntaxError) break
    }
  }
  const error = new Error(lastError?.name === 'ZodError' || lastError instanceof SyntaxError ? 'Gemini a renvoyé une extraction invalide.' : 'Le service Gemini est temporairement indisponible.')
  error.code = lastError?.name === 'ZodError' || lastError instanceof SyntaxError ? 'GEMINI_OUTPUT_ERROR' : 'GEMINI_PROVIDER_ERROR'
  error.cause = lastError
  throw error
}
