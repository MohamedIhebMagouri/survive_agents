import { prisma } from '@/lib/prisma'

const criticalityToDb = { Mineur: 'low', Modéré: 'medium', Majeur: 'high', Critique: 'critical' }
const criticalityFromDb = { low: 'Mineur', medium: 'Modéré', high: 'Majeur', critical: 'Critique' }
const strategyStatusToDb = { 'Planifié': 'PLANNED', 'En test': 'TESTED', 'En place': 'IMPLEMENTED' }
const strategyStatusFromDb = { PLANNED: 'Planifié', IN_PROGRESS: 'En test', IMPLEMENTED: 'En place', TESTED: 'En test', VALIDATED: 'En place' }
const resourceToType = {
  'Site de secours': 'INFRASTRUCTURE', Télétravail: 'RH_COMPETENCES', Redondance: 'APPLICATIONS_IT',
  Sauvegardes: 'APPLICATIONS_IT', Externalisation: 'SUPPLY_CHAIN', PCA: 'DOCUMENTATION', PRA: 'APPLICATIONS_IT',
}

export async function systemUserId() {
  const user = await prisma.user.upsert({
    where: { email: 'bia-system@survive.local' },
    update: {},
    create: { email: 'bia-system@survive.local', password: 'SYSTEM_ACCOUNT_DISABLED', firstName: 'BIA', lastName: 'System', role: 'ADMIN' },
    select: { id: true },
  })
  return user.id
}

export function factoryView(factory) {
  return {
    id: factory.id, name: factory.name, code: factory.code,
    location: [factory.city, factory.country].filter(Boolean).join(', ') || factory.address || '',
    description: factory.description || '', manager: factory.manager ? `${factory.manager.firstName || ''} ${factory.manager.lastName || ''}`.trim() : '',
    status: factory.isActive ? 'Actif' : 'En maintenance',
  }
}

export function factoryData(body, createdById) {
  const parts = String(body.location || '').split(',').map((item) => item.trim())
  return { name: body.name, code: body.code, description: body.description || null, city: parts[0] || null, country: parts[1] || null, isActive: body.status === 'Actif', ...(createdById ? { createdById } : {}) }
}

export function processView(process) {
  const meta = process.activitesCritiques && !Array.isArray(process.activitesCritiques) ? process.activitesCritiques : {}
  return {
    id: process.id,
    name: process.name,
    factoryId: process.factoryId,
    department: process.department,
    owner: process.processOwner || '',
    location: process.location || '',
    impact: process.impact || '',
    category: meta.category || 'Support',
    criticality: criticalityFromDb[process.criticality] || process.criticality,
    status: meta.status || 'Actif',
    description: process.description || '',
    rto: process.rto,
    rpo: process.rpo,
    mtpd: process.mtpd,
    mbco: process.mbco || '50%',
    activitesCritiques: process.activitesCritiques || null,
    ownerRole: process.ownerRole || '',
    ownerEmail: process.ownerEmail || '',
    ownerPhone: process.ownerPhone || '',
    interimManagers: process.interimManagers || null,
    criticalTimes: process.criticalTimes || '',
    financialImpact: process.financialImpact || '',
    operationalImpact: process.operationalImpact || '',
    reputationImpact: process.reputationImpact || '',
    operationalCapacityImpact: process.operationalCapacityImpact || '',
    mainFunctionality: process.mainFunctionality || '',
    productDependencies: process.productDependencies || '',
    interServiceDependencies: process.interServiceDependencies || '',
    externalSuppliers: process.externalSuppliers || '',
    supplierTasks: process.supplierTasks || '',
    supplierContact: process.supplierContact || '',
    supplierContinuityPlan: Boolean(process.supplierContinuityPlan),
    hasSLAClause: Boolean(process.hasSLAClause),
    supplierRTO: process.supplierRTO,
    supplierMTPD: process.supplierMTPD,
    legalObligations: process.legalObligations || '',
    legalReferences: process.legalReferences || '',
    legalAuthority: process.legalAuthority || '',
    legalDetails: process.legalDetails || '',
    nonComplianceConsequences: process.nonComplianceConsequences || '',
    itSystems: process.itSystems || '',
    systemCriticality: process.systemCriticality || '',
    systemImpact: process.systemImpact || '',
    supportedActivities: process.supportedActivities || '',
    hasBackupSystems: Boolean(process.hasBackupSystems),
    systemRTO: process.systemRTO,
    systemRPO: process.systemRPO,
    systemMTPD: process.systemMTPD,
    workarounds: process.workarounds || '',
    previousIncidents: process.previousIncidents || '',
  }
}

export function processData(body) {
  return {
    name: body.name, description: body.description || null, department: body.department || 'Support', location: body.location || 'Non renseigné', impact: body.impact || body.description || 'À évaluer',
    criticality: criticalityToDb[body.criticality] || 'medium', processOwner: body.owner || null, rto: Number(body.rto || 24), mtpd: Number(body.mtpd || 72), rpo: Number(body.rpo || 4), mbco: body.mbco || '50%',
    factoryId: body.factoryId || null,
    activitesCritiques: body.activitesCritiques || { category: body.category || 'Support', status: body.status || 'Actif' },
    ownerRole: body.ownerRole || null, ownerEmail: body.ownerEmail || null, ownerPhone: body.ownerPhone || null,
    interimManagers: body.interimManagers || null, criticalTimes: body.criticalTimes || null,
    financialImpact: body.financialImpact || null, operationalImpact: body.operationalImpact || null,
    reputationImpact: body.reputationImpact || null, operationalCapacityImpact: body.operationalCapacityImpact || null,
    mainFunctionality: body.mainFunctionality || null, productDependencies: body.productDependencies || null,
    interServiceDependencies: body.interServiceDependencies || null, externalSuppliers: body.externalSuppliers || null,
    supplierTasks: body.supplierTasks || null, supplierContact: body.supplierContact || null,
    supplierContinuityPlan: Boolean(body.supplierContinuityPlan), hasSLAClause: Boolean(body.hasSLAClause),
    supplierRTO: body.supplierRTO == null ? null : Number(body.supplierRTO), supplierMTPD: body.supplierMTPD == null ? null : Number(body.supplierMTPD),
    legalObligations: body.legalObligations || null, legalReferences: body.legalReferences || null,
    legalAuthority: body.legalAuthority || null, legalDetails: body.legalDetails || null,
    nonComplianceConsequences: body.nonComplianceConsequences || null, itSystems: body.itSystems || null,
    systemCriticality: body.systemCriticality || null, systemImpact: body.systemImpact || null,
    supportedActivities: body.supportedActivities || null, hasBackupSystems: Boolean(body.hasBackupSystems),
    systemRTO: body.systemRTO == null ? null : Number(body.systemRTO), systemRPO: body.systemRPO == null ? null : Number(body.systemRPO),
    systemMTPD: body.systemMTPD == null ? null : Number(body.systemMTPD), workarounds: body.workarounds || null,
    previousIncidents: body.previousIncidents || null,
  }
}

export function strategyView(item) {
  const details = item.resourceDetails || {}
  return { id: item.id, name: item.title, type: details.type || 'PCA', status: strategyStatusFromDb[item.status] || 'Planifié', processId: item.processId, factoryId: item.factoryId }
}

export function strategyData(body) {
  return { title: body.name, description: body.description || body.name, resourceCategory: resourceToType[body.type] || 'DOCUMENTATION', status: strategyStatusToDb[body.status] || 'PLANNED', processId: body.processId, factoryId: body.factoryId || null, resourceDetails: { type: body.type } }
}

export function gapView(item) {
  const currentLevel = Number(item.currentValue || 0); const expectedLevel = Number(item.targetValue || 0)
  return { id: item.id, processId: item.processId, factoryId: item.factoryId, currentLevel, expectedLevel, risks: item.description.split('\n').filter(Boolean), recommendations: (item.recommendation || '').split('\n').filter(Boolean) }
}

export function reportView(item) {
  const data = item.reportData && typeof item.reportData === 'object' ? item.reportData : {}
  return { id: item.id, ...data, recommendations: Array.isArray(data.recommendations) ? data.recommendations : [], version: data.version || '1.0', date: item.createdAt.toISOString().slice(0, 10), analyst: data.analyst || 'BIA System', globalScore: item.continuityLevel, status: item.status === 'DRAFT' ? 'Brouillon' : 'Validé' }
}

