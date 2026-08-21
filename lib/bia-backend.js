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
  return { id: process.id, name: process.name, factoryId: process.factoryId, department: process.department, owner: process.processOwner || '', category: meta.category || 'Support', criticality: criticalityFromDb[process.criticality], status: meta.status || 'Actif', description: process.description || '' }
}

export function processData(body) {
  return {
    name: body.name, description: body.description || null, department: body.department || 'Support', location: body.location || 'Non renseigné', impact: body.impact || body.description || 'À évaluer',
    criticality: criticalityToDb[body.criticality] || 'medium', processOwner: body.owner || null, rto: Number(body.rto || 24), mtpd: Number(body.mtpd || 72), rpo: Number(body.rpo || 4), mbco: body.mbco || '50%',
    supplierContinuityPlan: false, hasSLAClause: false, hasBackupSystems: false, dependsOnPhysicalInfra: false, canWorkRemotely: false, canUseOtherInfra: false, canBeReplaced: false, canReassignEquipment: false, backupCompatible: false, canReassignOfficeEquipment: false, neededAfterDisruption: false, hasAlternativeAccess: false, hasReplacement: false, hasAlternativeSupplier: false, supplierHasContinuityPlan: false,
    factoryId: body.factoryId || null, activitesCritiques: { category: body.category || 'Support', status: body.status || 'Actif' },
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
  return { id: item.id, ...(item.reportData || {}), version: item.reportData?.version || '1.0', date: item.createdAt.toISOString().slice(0, 10), analyst: item.reportData?.analyst || 'BIA System', globalScore: item.continuityLevel, status: item.status === 'DRAFT' ? 'Brouillon' : 'Validé' }
}

