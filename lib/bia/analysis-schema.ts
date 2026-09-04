import { z } from 'zod'

export type BiaRow = Record<string, string | number | boolean | null>

const row = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
const section = z.object({
  introduction: z.string().nullable().optional(),
  actions: z.array(z.string()).default([]),
  rows: z.array(row).default([]),
})

export const biaAnalysisSchema = z.object({
  metadata: z.object({
    reference: z.string().nullable().optional(), version: z.string().nullable().optional(),
    creationDate: z.string().nullable().optional(), classification: z.string().nullable().optional(),
    owner: z.string().nullable().optional(), validatedBy: z.string().nullable().optional(),
    preparedBy: z.string().nullable().optional(), reviewedBy: z.string().nullable().optional(),
    distribution: z.array(z.string()).default([]), history: z.array(row).default([]),
  }).default({ distribution: [], history: [] }),
  process: z.object({ name: z.string().nullable().optional(), entity: z.string().nullable().optional(), department: z.string().nullable().optional(), owner: z.string().nullable().optional(), role: z.string().nullable().optional(), phone: z.string().nullable().optional(), email: z.string().nullable().optional(), deputy: z.string().nullable().optional(), location: z.string().nullable().optional(), employees: z.union([z.string(), z.number()]).nullable().optional(), twentyFourSeven: z.union([z.boolean(), z.string()]).nullable().optional(), postsPerDay: z.union([z.string(), z.number()]).nullable().optional(), employeesPerShift: z.union([z.string(), z.number()]).nullable().optional() }).default({}),
  sections: z.object({
    introduction: section.default({ actions: [], rows: [] }), implementation: section.default({ actions: [], rows: [] }), recoveryGaps: section.default({ actions: [], rows: [] }), terminology: section.default({ actions: [], rows: [] }), generalInformation: section.default({ actions: [], rows: [] }), recoveryPriorities: section.default({ actions: [], rows: [] }), processAnalysis: section.default({ actions: [], rows: [] }), activities: section.default({ actions: [], rows: [] }), scopeDependencies: section.default({ actions: [], rows: [] }), outsourcedActivities: section.default({ actions: [], rows: [] }), legalRegulatory: section.default({ actions: [], rows: [] }), applicationsIt: section.default({ actions: [], rows: [] }), infrastructure: section.default({ actions: [], rows: [] }), skills: section.default({ actions: [], rows: [] }), officeEquipment: section.default({ actions: [], rows: [] }), documentation: section.default({ actions: [], rows: [] }), nextSteps: section.default({ actions: [], rows: [] }), acceptance: section.default({ actions: [], rows: [] }),
  }).partial().default({}),
})

export type BiaAnalysis = z.infer<typeof biaAnalysisSchema>
export type BiaSection = BiaAnalysis['sections'][keyof BiaAnalysis['sections']]

export const sectionTitles: Array<[keyof BiaAnalysis['sections'], string]> = [
  ['introduction', 'Introduction'], ['implementation', 'Mise en œuvre de la continuité des activités'], ['recoveryGaps', 'Détermination des exigences et des lacunes en matière de récupération'], ['terminology', 'Terminologie utilisée'], ['generalInformation', 'Informations générales sur le Processus'], ['recoveryPriorities', 'Priorités de rétablissement organisationnel'], ['processAnalysis', 'Analyse du processus'], ['activities', 'Analyse des activités'], ['scopeDependencies', 'Périmètre et dépendances'], ['outsourcedActivities', 'Activités externalisées'], ['legalRegulatory', 'Cadre légal et réglementaire'], ['applicationsIt', 'MES/Applications IT'], ['infrastructure', 'Infrastructure'], ['skills', 'Analyse des compétences (rôles)'], ['officeEquipment', 'Analyse des équipements bureautiques'], ['documentation', 'Analyse de la documentation'], ['nextSteps', 'Prochaines étapes'], ['acceptance', 'Acceptation du document'],
]