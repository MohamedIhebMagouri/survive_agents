const RECOVERY_RANGES = {
  critical: [60, 240],
  high: [240, 720],
  medium: [720, 1440],
  low: [1440, 4320],
}

const CRITICALITY_INPUT = {
  critique: 'critical',
  majeur: 'high',
  modere: 'medium',
  'modéré': 'medium',
  mineur: 'low',
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
}

const CRITICALITY_FR = {
  critical: 'Critique',
  high: 'Majeur',
  medium: 'Modéré',
  low: 'Mineur',
}

const LANGUAGE_POLICY =
  "Comprendre les données source quelle que soit leur langue, notamment le français, l'anglais, l'arabe standard, " +
  "le dialecte tunisien/Derja en alphabet arabe ou en Arabizi latin (3, 5, 7, 9), ainsi que les phrases mixtes. " +
  "Toutes les justifications, preuves, hypothèses, questions et alertes produites doivent être rédigées en français professionnel."

function parseMbco(value) {
  const parsed = Number.parseInt(String(value ?? '50').replace('%', ''), 10)
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 50
}

/**
 * Calcule les objectifs de reprise sans processus enfant. Les fonctions Vercel
 * Node.js ne fournissent pas d'interpréteur Python, contrairement au poste local.
 */
export async function calculateRecoveryMetrics(payload) {
  const process = payload?.process || {}
  const biaReports = payload?.biaReports || []
  const text = ['description', 'impact', 'name', 'department']
    .map((key) => String(process[key] || ''))
    .join(' ')
    .toLowerCase()

  let level = CRITICALITY_INPUT[String(process.criticality || '').toLowerCase()] || 'medium'
  const criticalTerms = /critique|vital|sécurité|securite|réglement|reglement|arrêt total|arret total|perte majeure|production bloquée|production bloquee/
  const highTerms = /financier|client|livraison|fournisseur|contrat|réputation|reputation|opérationnel|operationnel|indisponibilité|indisponibilite/

  if (criticalTerms.test(text)) level = 'critical'
  else if (highTerms.test(text) && ['low', 'medium'].includes(level)) level = 'high'

  const score = { low: 25, medium: 50, high: 75, critical: 90 }[level]
  const [minimumRto, maximumRto] = RECOVERY_RANGES[level]
  const currentMtpdHours = Number(process.mtpd)
  const mtpd = Math.max(
    maximumRto,
    Number.isFinite(currentMtpdHours) && currentMtpdHours > 0
      ? Math.round(currentMtpdHours * 60)
      : maximumRto * 2,
  )
  const rto = Math.max(minimumRto, Math.min(maximumRto, Math.floor(mtpd / 2)))
  const rpo = Math.max(0, Math.min(rto, Math.floor(rto / 4)))
  const missingInformation = []
  const warnings = []

  if (!process.impact) {
    missingInformation.push({ field: 'impact', reason: 'Impact métier non renseigné', blocking: false })
  }
  if (!biaReports.length) {
    warnings.push('Aucun rapport BIA détaillé fourni; proposition fondée sur la criticité et les valeurs existantes.')
  }

  const confidence = Number((0.76 - (missingInformation.length ? 0.12 : 0) - (biaReports.length ? 0 : 0.08)).toFixed(2))
  const status = ['critical', 'high'].includes(level) || confidence < 0.8 ? 'HUMAN_REVIEW' : 'PROPOSED'
  const rationale = [
    `La description et l’impact conduisent à une criticité ${CRITICALITY_FR[level]}; le RTO est borné entre ${minimumRto} et ${maximumRto} minutes.`,
    'Le RPO est limité à un quart du RTO et le MTPD reste supérieur au RTO.',
  ]
  const metricMetadata = Object.fromEntries(
    [['rto', rto], ['rpo', rpo], ['mtpd', mtpd]].map(([name, value]) => [name, {
      value,
      unit: 'minutes',
      source: 'business_rule',
      confidence,
      evidence: 'Règle déterministe basée sur la criticité et les contraintes de cohérence.',
    }]),
  )

  return {
    status,
    processId: process.id,
    proposal: { rtoMinutes: rto, rpoMinutes: rpo, mtpdMinutes: mtpd, mbcoPercent: parseMbco(process.mbco) },
    metricMetadata,
    criticality: {
      level: CRITICALITY_FR[level],
      score,
      factors: [{ name: 'description_et_impact', score, evidence: text.slice(0, 300) || 'Criticité déclarée du processus' }],
    },
    confidence,
    rationale,
    assumptions: [LANGUAGE_POLICY],
    evidence: [{
      source: 'process',
      field: 'description,impact,criticité',
      value: text.slice(0, 500),
      interpretation: 'Informations multilingues interprétées et normalisées en français par le Process Capture Agent',
    }],
    warnings,
    missingInformation,
    questions: [],
    constraints: { rpoLessOrEqualRto: true, rtoLessOrEqualMtpd: true, allValuesPositive: true },
    inputSnapshot: process,
    impactSnapshot: biaReports,
    dependencySnapshot: process.activitesCritiques || {},
  }
}
