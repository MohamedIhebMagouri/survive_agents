const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const factoryRows = [
  ['TUN-N01', 'Usine Tunis Nord', 'Tunis', 'Tunisie', "Site de production principal, activités d'assemblage électronique."],
  ['SFX-L02', 'Site Logistique Sfax', 'Sfax', 'Tunisie', 'Plateforme logistique et entreposage régional.'],
  ['LYO-D01', 'Data Center Lyon', 'Lyon', 'France', 'Centre de données hébergeant les applications critiques du groupe.'],
  ['CAS-N03', 'Usine Casablanca', 'Casablanca', 'Maroc', "Unité d'assemblage et de conditionnement."],
]
const processRows = [
  ['Traitement des commandes clients', 'TUN-N01', 'Commercial', 'Sami Trabelsi', 'Support', 'critical', 'Réception, validation et suivi des commandes clients B2B.'],
  ['Production ligne électronique A', 'TUN-N01', 'Production', 'Amira Ben Salah', 'Coeur de métier', 'critical', 'Assemblage et test des cartes électroniques, ligne A.'],
  ['Gestion des stocks entrepôt', 'SFX-L02', 'Logistique', 'Karim Jaziri', 'Support', 'high', 'Réception, stockage et préparation des expéditions.'],
  ['Hébergement applications SaaS', 'LYO-D01', 'IT & Systèmes', 'Claire Dubois', 'Coeur de métier', 'critical', 'Exploitation des plateformes SaaS multi-clients.'],
  ['Paie et gestion RH', 'CAS-N03', 'Ressources Humaines', 'Youssef El Amrani', 'Support', 'medium', 'Traitement mensuel de la paie et administration du personnel.'],
  ['Contrôle qualité produits finis', 'TUN-N01', 'Qualité', 'Nadia Ferchichi', 'Pilotage', 'high', 'Vérification de conformité avant expédition.'],
]
const defaults = { supplierContinuityPlan:false, hasSLAClause:false, hasBackupSystems:false, dependsOnPhysicalInfra:false, canWorkRemotely:false, canUseOtherInfra:false, canBeReplaced:false, canReassignEquipment:false, backupCompatible:false, canReassignOfficeEquipment:false, neededAfterDisruption:false, hasAlternativeAccess:false, hasReplacement:false, hasAlternativeSupplier:false, supplierHasContinuityPlan:false }

async function main() {
  const user = await prisma.user.upsert({ where:{ email:'bia-system@survive.local' }, update:{}, create:{ email:'bia-system@survive.local', password:'SYSTEM_ACCOUNT_DISABLED', firstName:'BIA', lastName:'System', role:'ADMIN' } })
  const factories = {}
  for (const [code,name,city,country,description] of factoryRows) factories[code] = await prisma.factory.upsert({ where:{ code }, update:{ name,city,country,description }, create:{ code,name,city,country,description,isActive:code!=='CAS-N03',createdById:user.id } })
  const processes = {}
  for (const [name,code,department,owner,category,criticality,description] of processRows) {
    const data = { name, factoryId:factories[code].id, department, processOwner:owner, criticality, description, location:`${factories[code].city}, ${factories[code].country}`, impact:'À évaluer', rto:24, mtpd:72, rpo:4, mbco:'50%', activitesCritiques:{category,status:'Actif'}, ...defaults }
    const existing = await prisma.process.findFirst({ where:{ name } })
    processes[name] = existing ? await prisma.process.update({ where:{id:existing.id},data }) : await prisma.process.create({data})
  }
  const strategyRows = [
    ['Ligne de production de secours','Production ligne électronique A','Site de secours','INFRASTRUCTURE','IMPLEMENTED'],
    ['Stock tampon composants critiques','Production ligne électronique A','Sauvegardes','SUPPLY_CHAIN','IMPLEMENTED'],
    ['Réplication multi-région','Hébergement applications SaaS','Redondance','APPLICATIONS_IT','IMPLEMENTED'],
    ['Bascule cloud secondaire','Hébergement applications SaaS','PRA','APPLICATIONS_IT','TESTED'],
    ['Entrepôt de repli Sfax-Sud','Gestion des stocks entrepôt','Site de secours','INFRASTRUCTURE','PLANNED'],
    ['Contrat multi-transporteurs','Gestion des stocks entrepôt','Externalisation','SUPPLY_CHAIN','PLANNED'],
    ['Procédure de secours manuelle','Traitement des commandes clients','PCA','DOCUMENTATION','IMPLEMENTED'],
    ['Astreinte télétravail 24/7','Hébergement applications SaaS','Télétravail','RH_COMPETENCES','IMPLEMENTED'],
  ]
  for (const [title,processName,type,resourceCategory,status] of strategyRows) { const p=processes[processName]; const data={title,description:title,processId:p.id,factoryId:p.factoryId,resourceCategory,status,resourceDetails:{type}}; const old=await prisma.continuityStrategy.findFirst({where:{title}}); old ? await prisma.continuityStrategy.update({where:{id:old.id},data}) : await prisma.continuityStrategy.create({data}) }
  const gapRows = [
    ['Capacité de production insuffisante','Production ligne électronique A',65,90,'Absence de second site de production\nDépendance à un fournisseur unique','Qualifier un fournisseur alternatif\nÉtudier un site de production de secours'],
    ['Capacité astreinte limitée','Hébergement applications SaaS',85,95,"Astreinte reposant sur 2 personnes seulement","Élargir l'équipe d'astreinte à 4 personnes"],
    ['Site de repli non validé','Gestion des stocks entrepôt',40,75,'Site de repli non testé depuis 12 mois\nPas de contrat multi-transporteurs signé','Planifier un test grandeur nature\nSigner le second contrat transporteur'],
  ]
  for (const [title,processName,current,target,description,recommendation] of gapRows) { const p=processes[processName]; const data={title,description,gapType:'RESILIENCE',severity:target-current>=30?'CRITICAL':'HIGH',currentValue:String(current),targetValue:String(target),gap:String(target-current),recommendation,processId:p.id,factoryId:p.factoryId}; const old=await prisma.continuityGap.findFirst({where:{title}}); old ? await prisma.continuityGap.update({where:{id:old.id},data}) : await prisma.continuityGap.create({data}) }
  const reports = [
    ['Production ligne électronique A',88,'1.2','Amira Ben Salah'], ['Hébergement applications SaaS',94,'2.0','Claire Dubois'], ['Gestion des stocks entrepôt',62,'1.0','Karim Jaziri'], ['Traitement des commandes clients',47,'1.0','Sami Trabelsi'],
  ]
  for (const [processName,score,version,analyst] of reports) { const p=processes[processName]; const name=`BIA ${processName}`; const reportData={processId:p.id,factoryId:p.factoryId,version,analyst,impactScores:{financier:score,operationnel:score,reglementaire:score-10,reputationnel:score-5,client:score,securite:score-15,environnemental:Math.max(10,score-40)},resources:['humaines','applications'],dependencies:{internes:[],externes:[],fournisseurs:[],partenaires:[]},minimalActivities:'Activités prioritaires à maintenir.',minimalLevel:50,rto:'4h',rpo:'1h',mtpd:'48h',mbco:'50%',consequences:'Impacts opérationnels et financiers.',existingMeasures:'Mesures de continuité existantes.',recommendations:[]}; const old=await prisma.biaReport.findFirst({where:{name}}); const data={name,format:'JSON',status:'GENERATED',totalProcesses:1,continuityLevel:score,reportData,includedProcessIds:[p.id],factoryId:p.factoryId,authorId:user.id,shareToken:`seed-${p.id}`}; old ? await prisma.biaReport.update({where:{id:old.id},data}) : await prisma.biaReport.create({data}) }
  console.log('Seed BIA terminé : 4 usines, 6 processus, 8 stratégies, 3 gaps et 4 analyses.')
}
main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
