// Données de démonstration pour le module Business Impact Analysis (BIA)
// À remplacer par des appels API réels (GET /factories, GET /processes, GET /bia, ...)

export const factories = [
  {
    id: 'usine-tunis-nord',
    name: 'Usine Tunis Nord',
    code: 'TUN-N01',
    location: 'Tunis, Tunisie',
    description: "Site de production principal, activités d'assemblage électronique.",
    manager: 'Amira Ben Salah',
    status: 'Actif',
  },
  {
    id: 'site-logistique-sfax',
    name: 'Site Logistique Sfax',
    code: 'SFX-L02',
    location: 'Sfax, Tunisie',
    description: 'Plateforme logistique et entreposage régional.',
    manager: 'Karim Jaziri',
    status: 'Actif',
  },
  {
    id: 'data-center-lyon',
    name: 'Data Center Lyon',
    code: 'LYO-D01',
    location: 'Lyon, France',
    description: 'Centre de données hébergeant les applications critiques du groupe.',
    manager: 'Claire Dubois',
    status: 'Actif',
  },
  {
    id: 'usine-casablanca',
    name: 'Usine Casablanca',
    code: 'CAS-N03',
    location: 'Casablanca, Maroc',
    description: "Unité d'assemblage et de conditionnement.",
    manager: 'Youssef El Amrani',
    status: 'En maintenance',
  },
]

export const departments = [
  'Production',
  'IT & Systèmes',
  'Logistique',
  'Ressources Humaines',
  'Finance',
  'Qualité',
  'Commercial',
]

export const processCategories = ['Coeur de métier', 'Support', 'Pilotage']
export const criticalityLevels = ['Critique', 'Majeur', 'Modéré', 'Mineur']
export const processStatuses = ['Actif', 'Archivé', 'Supprimé']

export const processes = [
  {
    id: 'proc-1',
    name: 'Traitement des commandes clients',
    factoryId: 'usine-tunis-nord',
    department: 'Commercial',
    owner: 'Sami Trabelsi',
    category: 'Support',
    criticality: 'Critique',
    status: 'Actif',
    description: 'Réception, validation et suivi des commandes clients B2B.',
  },
  {
    id: 'proc-2',
    name: 'Production ligne électronique A',
    factoryId: 'usine-tunis-nord',
    department: 'Production',
    owner: 'Amira Ben Salah',
    category: 'Coeur de métier',
    criticality: 'Critique',
    status: 'Actif',
    description: "Assemblage et test des cartes électroniques, ligne A.",
  },
  {
    id: 'proc-3',
    name: 'Gestion des stocks entrepôt',
    factoryId: 'site-logistique-sfax',
    department: 'Logistique',
    owner: 'Karim Jaziri',
    category: 'Support',
    criticality: 'Majeur',
    status: 'Actif',
    description: 'Réception, stockage et préparation des expéditions.',
  },
  {
    id: 'proc-4',
    name: 'Hébergement applications SaaS',
    factoryId: 'data-center-lyon',
    department: 'IT & Systèmes',
    owner: 'Claire Dubois',
    category: 'Coeur de métier',
    criticality: 'Critique',
    status: 'Actif',
    description: 'Exploitation des plateformes SaaS multi-clients.',
  },
  {
    id: 'proc-5',
    name: 'Paie et gestion RH',
    factoryId: 'usine-casablanca',
    department: 'Ressources Humaines',
    owner: 'Youssef El Amrani',
    category: 'Support',
    criticality: 'Modéré',
    status: 'Actif',
    description: 'Traitement mensuel de la paie et administration du personnel.',
  },
  {
    id: 'proc-6',
    name: 'Contrôle qualité produits finis',
    factoryId: 'usine-tunis-nord',
    department: 'Qualité',
    owner: 'Nadia Ferchichi',
    category: 'Pilotage',
    criticality: 'Majeur',
    status: 'Actif',
    description: 'Vérification de conformité avant expédition.',
  },
]

export const interruptionPeriods = ['2h', '4h', '8h', '24h', '48h', '72h', '1 semaine', '2 semaines']

export const impactCategories = [
  { key: 'financier', label: 'Financier', icon: 'payments' },
  { key: 'operationnel', label: 'Opérationnel', icon: 'settings' },
  { key: 'reglementaire', label: 'Réglementaire', icon: 'gavel' },
  { key: 'reputationnel', label: 'Réputationnel', icon: 'campaign' },
  { key: 'client', label: 'Client', icon: 'groups' },
  { key: 'securite', label: 'Santé / Sécurité', icon: 'health_and_safety' },
  { key: 'environnemental', label: 'Environnemental', icon: 'eco' },
]

export const resourceCategories = [
  { key: 'humaines', label: 'Ressources humaines', icon: 'groups' },
  { key: 'applications', label: 'Applications', icon: 'apps' },
  { key: 'serveurs', label: 'Serveurs', icon: 'dns' },
  { key: 'bases_donnees', label: 'Bases de données', icon: 'database' },
  { key: 'batiments', label: 'Bâtiments', icon: 'apartment' },
  { key: 'fournisseurs', label: 'Fournisseurs', icon: 'local_shipping' },
  { key: 'equipements', label: 'Équipements', icon: 'precision_manufacturing' },
  { key: 'documents', label: 'Documents critiques', icon: 'description' },
]

export const strategyTypes = [
  'Site de secours',
  'Télétravail',
  'Redondance',
  'Sauvegardes',
  'Externalisation',
  'PCA',
  'PRA',
]

function criticalityFromScore(score) {
  if (score >= 80) return 'Critique'
  if (score >= 60) return 'Majeur'
  if (score >= 35) return 'Modéré'
  return 'Mineur'
}

export const biaReports = [
  {
    id: 'bia-1',
    processId: 'proc-2',
    version: '1.2',
    date: '2026-06-02',
    analyst: 'Amira Ben Salah',
    status: 'Validé',
    globalScore: 88,
    impactScores: { financier: 90, operationnel: 92, reglementaire: 70, reputationnel: 80, client: 88, securite: 85, environnemental: 40 },
    resources: ['humaines', 'applications', 'serveurs', 'equipements'],
    dependencies: {
      internes: ['Chaîne logistique amont', 'Service qualité'],
      externes: ['Fournisseur de composants Alpha'],
      fournisseurs: ['Alpha Electronics', 'TransLog SA'],
      partenaires: ['Cabinet de certification CE'],
    },
    minimalActivities: 'Maintien de la ligne A à 40% de capacité, contrôle qualité renforcé.',
    minimalLevel: 40,
    rto: '4h',
    rpo: '1h',
    mtpd: '48h',
    mbco: '40%',
    consequences: 'Perte de production estimée à 12 000 DT/heure, pénalités contractuelles possibles après 24h.',
    existingMeasures: 'Groupe électrogène de secours, stock tampon de composants de 3 jours.',
    recommendations: [
      { text: 'Doubler le stock tampon de composants critiques', priority: 'Haute', owner: 'Amira Ben Salah' },
      { text: 'Contractualiser un second fournisseur de composants', priority: 'Moyenne', owner: 'Achats' },
    ],
  },
  {
    id: 'bia-2',
    processId: 'proc-4',
    version: '2.0',
    date: '2026-06-18',
    analyst: 'Claire Dubois',
    status: 'Validé',
    globalScore: 94,
    impactScores: { financier: 95, operationnel: 97, reglementaire: 85, reputationnel: 92, client: 96, securite: 70, environnemental: 30 },
    resources: ['applications', 'serveurs', 'bases_donnees', 'documents'],
    dependencies: {
      internes: ['Équipe DevOps', 'Support client N2'],
      externes: ['Fournisseur cloud secondaire'],
      fournisseurs: ['CloudProvider EU'],
      partenaires: ['Hébergeur secours Lyon-Sud'],
    },
    minimalActivities: 'Bascule automatique sur site de secours, API en mode dégradé.',
    minimalLevel: 60,
    rto: '2h',
    rpo: '15min',
    mtpd: '8h',
    mbco: '60%',
    consequences: "Interruption facturable aux clients Enterprise, risque de résiliation de contrats SLA.",
    existingMeasures: 'Réplication multi-région, sauvegardes horaires, astreinte 24/7.',
    recommendations: [
      { text: 'Automatiser les tests de bascule mensuels', priority: 'Haute', owner: 'Claire Dubois' },
      { text: 'Réviser les SLA fournisseurs cloud', priority: 'Moyenne', owner: 'Juridique' },
    ],
  },
  {
    id: 'bia-3',
    processId: 'proc-3',
    version: '1.0',
    date: '2026-05-20',
    analyst: 'Karim Jaziri',
    status: 'En cours',
    globalScore: 62,
    impactScores: { financier: 65, operationnel: 70, reglementaire: 40, reputationnel: 55, client: 60, securite: 45, environnemental: 25 },
    resources: ['humaines', 'batiments', 'equipements', 'fournisseurs'],
    dependencies: {
      internes: ['Service transport'],
      externes: ['Transporteurs partenaires'],
      fournisseurs: ['TransLog SA'],
      partenaires: [],
    },
    minimalActivities: "Priorisation des expéditions clients Grands Comptes.",
    minimalLevel: 50,
    rto: '24h',
    rpo: '4h',
    mtpd: '1 semaine',
    mbco: '50%',
    consequences: 'Retards de livraison, coûts de stockage additionnels.',
    existingMeasures: 'Site de repli à 20km, contrat multi-transporteurs.',
    recommendations: [
      { text: "Finaliser l'accord avec le second transporteur", priority: 'Moyenne', owner: 'Karim Jaziri' },
    ],
  },
  {
    id: 'bia-4',
    processId: 'proc-1',
    version: '1.0',
    date: '2026-04-11',
    analyst: 'Sami Trabelsi',
    status: 'Brouillon',
    globalScore: 47,
    impactScores: { financier: 55, operationnel: 50, reglementaire: 30, reputationnel: 45, client: 60, securite: 20, environnemental: 10 },
    resources: ['applications', 'humaines', 'documents'],
    dependencies: {
      internes: ['Service logistique'],
      externes: ['Plateforme e-commerce B2B'],
      fournisseurs: [],
      partenaires: [],
    },
    minimalActivities: 'Traitement manuel des commandes prioritaires.',
    minimalLevel: 30,
    rto: '8h',
    rpo: '2h',
    mtpd: '72h',
    mbco: '30%',
    consequences: 'Retards de traitement, insatisfaction client.',
    existingMeasures: 'Procédure de secours papier disponible.',
    recommendations: [
      { text: 'Digitaliser la procédure de secours', priority: 'Basse', owner: 'Sami Trabelsi' },
    ],
  },
]

export function getCriticality(score) {
  return criticalityFromScore(score)
}

export function getProcessById(id) {
  return processes.find((process) => process.id === id)
}

export function getFactoryById(id) {
  return factories.find((factory) => factory.id === id)
}

export function getBiaById(id) {
  return biaReports.find((bia) => bia.id === id)
}

export const gapAnalyses = [
  {
    id: 'gap-1',
    processId: 'proc-2',
    currentLevel: 65,
    expectedLevel: 90,
    risks: ['Absence de second site de production', 'Dépendance à un fournisseur unique'],
    recommendations: ['Qualifier un fournisseur alternatif', 'Étudier un site de production de secours'],
  },
  {
    id: 'gap-2',
    processId: 'proc-4',
    currentLevel: 85,
    expectedLevel: 95,
    risks: ['Astreinte reposant sur 2 personnes seulement'],
    recommendations: ["Élargir l'équipe d'astreinte à 4 personnes"],
  },
  {
    id: 'gap-3',
    processId: 'proc-3',
    currentLevel: 40,
    expectedLevel: 75,
    risks: ['Site de repli non testé depuis 12 mois', 'Pas de contrat multi-transporteurs signé'],
    recommendations: ['Planifier un test grandeur nature', 'Signer le second contrat transporteur'],
  },
]

export const recoveryStrategies = [
  { id: 'strat-1', biaId: 'bia-1', processId: 'proc-2', name: 'Ligne de production de secours', type: 'Site de secours', status: 'En place' },
  { id: 'strat-2', biaId: 'bia-1', processId: 'proc-2', name: 'Stock tampon composants critiques', type: 'Sauvegardes', status: 'En place' },
  { id: 'strat-3', biaId: 'bia-2', processId: 'proc-4', name: 'Réplication multi-région', type: 'Redondance', status: 'En place' },
  { id: 'strat-4', biaId: 'bia-2', processId: 'proc-4', name: 'Bascule cloud secondaire', type: 'PRA', status: 'En test' },
  { id: 'strat-5', biaId: 'bia-3', processId: 'proc-3', name: 'Entrepôt de repli Sfax-Sud', type: 'Site de secours', status: 'Planifié' },
  { id: 'strat-6', biaId: 'bia-3', processId: 'proc-3', name: 'Contrat multi-transporteurs', type: 'Externalisation', status: 'Planifié' },
  { id: 'strat-7', biaId: 'bia-4', processId: 'proc-1', name: 'Procédure de secours manuelle', type: 'PCA', status: 'En place' },
  { id: 'strat-8', biaId: 'bia-2', processId: 'proc-4', name: 'Astreinte télétravail 24/7', type: 'Télétravail', status: 'En place' },
]

export function computeDashboardMetrics() {
  const totalBia = biaReports.length
  const criticalProcesses = biaReports.filter((bia) => getCriticality(bia.globalScore) === 'Critique').length
  const factoriesCovered = new Set(
    biaReports.map((bia) => getProcessById(bia.processId)?.factoryId).filter(Boolean),
  ).size
  const completed = biaReports.filter((bia) => bia.status === 'Validé').length
  const completionRate = Math.round((completed / totalBia) * 100)

  const distribution = criticalityLevels.map((level) => ({
    level,
    count: biaReports.filter((bia) => getCriticality(bia.globalScore) === level).length,
  }))

  const evolution = [
    { month: 'Fév', score: 58 },
    { month: 'Mars', score: 64 },
    { month: 'Avr', score: 67 },
    { month: 'Mai', score: 71 },
    { month: 'Juin', score: 73 },
    { month: 'Juil', score: 76 },
  ]

  return { totalBia, criticalProcesses, factoriesCovered, completionRate, distribution, evolution }
}
