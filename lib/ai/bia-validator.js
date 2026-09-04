const numberValue = (value) => {
  const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

export function validateBia(payload = {}) {
  const errors = []
  const warnings = []
  const add = (severity, field, message, blocking = severity === 'high') => {
    const item = { severity, field, message, requiresHumanReview: severity !== 'low' }
    ;(blocking ? errors : warnings).push(item)
  }
  if (!payload.processId) add('high', 'processId', 'Le processus associé est obligatoire.')
  const rto = numberValue(payload.rto)
  const rpo = numberValue(payload.rpo)
  const mtpd = numberValue(payload.mtpd)
  const mbco = numberValue(payload.mbco)
  if (rto === null || rto <= 0) add('high', 'rto', 'Le RTO doit être un nombre strictement positif.')
  if (rpo === null || rpo < 0) add('high', 'rpo', 'Le RPO doit être un nombre positif ou nul.')
  if (mtpd === null || mtpd <= 0) add('high', 'mtpd', 'Le MTPD doit être un nombre strictement positif.')
  if (mbco === null || mbco < 0 || mbco > 100) add('medium', 'mbco', 'Le MBCO doit être compris entre 0 et 100 %.')
  if (rpo !== null && rto !== null && rpo > rto) add('high', 'rpo', 'Le RPO ne peut pas dépasser le RTO.')
  if (rto !== null && mtpd !== null && rto > mtpd) add('high', 'rto', 'Le RTO ne peut pas dépasser le MTPD.')
  if (!String(payload.objective || '').trim()) add('medium', 'objective', 'L’objectif de l’analyse n’est pas renseigné.', false)
  if (!String(payload.analyst || payload.owner || '').trim()) add('low', 'analyst', 'L’analyste ou le responsable n’est pas renseigné.', false)
  return { valid: errors.length === 0, errors, warnings, checkedAt: new Date().toISOString() }
}
