import { processDraftSchema } from '@/lib/ai/process-capture-schema'

export function validateProcessDraft(process, factories) {
  const errors = []
  const warnings = []
  const factory = factories.find((item) => item.id === process.factoryId)
  const result = processDraftSchema.safeParse(process)
  if (!result.success) errors.push(...result.error.issues.map((issue) => `${issue.path.join('.') || 'process'}: ${issue.message}`))
  if (!factory) errors.push('Une usine existante doit être sélectionnée.')
  if (Number.isInteger(process.rpo) && Number.isInteger(process.rto) && process.rpo > process.rto) errors.push('Le RPO ne peut pas dépasser le RTO.')
  if (Number.isInteger(process.rto) && Number.isInteger(process.mtpd) && process.rto > process.mtpd) errors.push('Le RTO ne peut pas dépasser le MTPD.')
  if (process.criticality === null || process.criticality === undefined) warnings.push('La criticité doit être confirmée.')
  return { valid: errors.length === 0, errors, warnings, factory }
}

export function missingForProcess(process, validation) {
  const missingFields = []
  if (!process.name) missingFields.push({ field: 'name', requiredForCreation: true, reason: 'Le nom du processus est absent.' })
  if (!process.factoryId || !validation.factory) missingFields.push({ field: 'factoryId', requiredForCreation: true, reason: 'Une usine réelle est requise pour créer le processus.' })
  return missingFields
}

export function validateProcessPayload(body, factory) {
  const errors = []
  const criticalities = ['Mineur', 'Modéré', 'Majeur', 'Critique', 'low', 'medium', 'high', 'critical']
  if (!String(body.name || '').trim()) errors.push('Nom requis')
  if (!String(body.department || '').trim()) errors.push('Département requis')
  if (!factory) errors.push('Usine inexistante')
  if (!['Support', 'Coeur de métier', 'Pilotage'].includes(body.category)) errors.push('Catégorie invalide')
  if (!criticalities.includes(body.criticality)) errors.push('Criticité invalide')
  const rto = Number(body.rto ?? 24); const rpo = Number(body.rpo ?? 4); const mtpd = Number(body.mtpd ?? 72)
  if (!Number.isInteger(rto) || rto <= 0) errors.push('RTO invalide')
  if (!Number.isInteger(rpo) || rpo < 0) errors.push('RPO invalide')
  if (!Number.isInteger(mtpd) || mtpd <= 0) errors.push('MTPD invalide')
  if (rpo > rto) errors.push('Le RPO ne peut pas dépasser le RTO')
  if (rto > mtpd) errors.push('Le RTO ne peut pas dépasser le MTPD')
  const mbco = Number.parseInt(String(body.mbco ?? '50%').replace('%', ''), 10)
  if (!Number.isInteger(mbco) || mbco < 0 || mbco > 100) errors.push('MBCO invalide')
  return { valid: errors.length === 0, errors }
}
