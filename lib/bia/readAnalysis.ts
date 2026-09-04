import * as XLSX from 'xlsx'
import { biaAnalysisSchema, BiaAnalysis, BiaRow } from './analysis-schema'

export type AnalysisReadResult = { analysis: BiaAnalysis; incompleteSections: string[]; source: 'json' | 'xlsx' | 'database' }

const clean = (value: unknown) => value === undefined || value === '' ? null : value as string | number | boolean | null
const asRows = (values: unknown[][]): BiaRow[] => {
  const [headers = [], ...body] = values
  return body.filter(row => row.some(value => value !== undefined && value !== '')).map(row => Object.fromEntries(headers.map((header, index) => [String(header || `colonne_${index + 1}`), clean(row[index])])) as BiaRow)
}
const keyForSheet = (name: string) => ({ introduction: 'introduction', miseenoeuvre: 'implementation', lacunes: 'recoveryGaps', terminologie: 'terminology', informationsgenerales: 'generalInformation', priorites: 'recoveryPriorities', analyseprocessus: 'processAnalysis', activites: 'activities', dependances: 'scopeDependencies', externalisees: 'outsourcedActivities', legal: 'legalRegulatory', applicationsit: 'applicationsIt', infrastructure: 'infrastructure', competences: 'skills', equipements: 'officeEquipment', documentation: 'documentation', prochainesetapes: 'nextSteps', acceptation: 'acceptance' }[name.replace(/[\s_\-]/g, '').toLowerCase()])

export function parseAnalysisJson(value: unknown): AnalysisReadResult {
  const input = typeof value === 'string' ? JSON.parse(value) : value
  const analysis = biaAnalysisSchema.parse(input)
  return { analysis, incompleteSections: findIncomplete(analysis), source: 'json' }
}

export function parseAnalysisXlsx(buffer: Buffer): AnalysisReadResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sections = Object.fromEntries(workbook.SheetNames.map(name => {
    const key = keyForSheet(name)
    return key ? [key, { rows: asRows(XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: null })) }] : []
  }))
  return { analysis: biaAnalysisSchema.parse({ sections }), incompleteSections: findIncomplete(biaAnalysisSchema.parse({ sections })), source: 'xlsx' }
}

export function parseAnalysisBuffer(buffer: Buffer, fileName: string) { return /\.xlsx?$/i.test(fileName) ? parseAnalysisXlsx(buffer) : parseAnalysisJson(buffer.toString('utf8')) }

function findIncomplete(analysis: BiaAnalysis) { return Object.entries(analysis.sections).filter(([, value]) => !value.introduction || value.rows.length === 0).map(([key]) => key) }

export function analysisFromProcess(process: Record<string, unknown>, reportData: Record<string, unknown> = {}, factory?: Record<string, unknown> | null): AnalysisReadResult {
  const existingSections = reportData.sections && typeof reportData.sections === 'object' ? reportData.sections as Record<string, unknown> : {}
  const merged = { ...reportData, process: { name: process.name, entity: factory?.name, department: process.department, owner: process.processOwner, role: process.ownerRole, phone: process.ownerPhone, email: process.ownerEmail, location: process.location || factory?.city }, sections: { ...existingSections, generalInformation: { rows: [{ Element: 'Nom du processus', Information: process.name }, { Element: 'Département', Information: process.department }, { Element: 'Responsable', Information: process.processOwner }, { Element: 'Localisation', Information: process.location || factory?.name }] }, processAnalysis: { rows: [{ Criticité: process.criticality, RTO: process.rto, MTPD: process.mtpd, MBCO: process.mbco, Justificatif: process.impact }] }, applicationsIt: { rows: [{ Application: process.itSystems, Criticité: process.systemCriticality, Impact: process.systemImpact, 'Activités soutenues': process.supportedActivities, RTO: process.systemRTO, RPO: process.systemRPO, MTPD: process.systemMTPD, 'Solutions de repli': process.workarounds }] }, outsourcedActivities: { rows: [{ Externalisé: Boolean(process.externalSuppliers), Fournisseur: process.externalSuppliers, 'Tâches du fournisseur': process.supplierTasks, Coordonnées: process.supplierContact, 'PCA fournisseur ?': process.supplierContinuityPlan, 'Contrat/SLA continuité ?': process.hasSLAClause, RTO: process.supplierRTO, MTPD: process.supplierMTPD }] }, legalRegulatory: { rows: [{ Activité: process.name, 'Obligations légales': process.legalObligations, Référence: process.legalReferences, Autorité: process.legalAuthority, Détails: process.legalDetails, Conséquences: process.nonComplianceConsequences }] } } }
  const analysis = biaAnalysisSchema.parse(merged)
  return { analysis, incompleteSections: findIncomplete(analysis), source: 'database' }
}