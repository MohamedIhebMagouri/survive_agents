import { z } from 'zod'

const nullableText = z.string().nullable().optional()
export const biaRecommendationsInputSchema = z.object({
  bia: z.object({
    processId: z.string().min(1), processName: z.string().default(''), factoryId: nullableText,
    objective: z.string().default(''), owner: z.string().default(''), version: z.string().default('1.0'), analysisDate: z.string().default(''), analyst: z.string().default(''),
    globalScore: z.number().min(0).max(100), impactScores: z.record(z.string(), z.number()).default({}), impactMatrix: z.record(z.string(), z.unknown()).default({}),
    resources: z.array(z.string()).default([]), dependencies: z.record(z.string(), z.array(z.string())).default({}), minimalActivities: z.string().default(''), minimalLevel: z.number().min(0).max(100),
    rto: z.string(), rpo: z.string(), mtpd: z.string(), mbco: z.string(), consequences: z.string().default(''), existingMeasures: z.string().default(''), recommendations: z.array(z.unknown()).default([]),
  }),
  mode: z.enum(['generate', 'regenerate', 'review']).default('generate'), clarifications: z.array(z.unknown()).default([]),
})

const recommendationSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), priority: z.enum(['Critique', 'Élevée', 'Moyenne', 'Faible']), category: z.string(), status: z.literal('À valider'),
  suggestedOwner: z.string(), implementationDelay: z.string(), estimatedEffort: z.enum(['Élevé', 'Moyen', 'Faible']), isoReferences: z.array(z.string()), evidence: z.array(z.string()), rationale: z.string(), assumptions: z.array(z.string()), dependencies: z.array(z.string()), confidence: z.number().min(0).max(1),
})
export const biaRecommendationsOutputSchema = z.object({
  status: z.enum(['READY_FOR_REVIEW', 'NEEDS_CLARIFICATION', 'ERROR']), processId: z.string(), summary: z.string(),
  overallAssessment: z.object({ score: z.number().min(0).max(100), level: z.string(), strengths: z.array(z.string()), weaknesses: z.array(z.string()) }),
  recommendations: z.array(recommendationSchema), gaps: z.array(z.object({ title: z.string(), severity: z.enum(['Critique', 'Élevée', 'Moyenne', 'Faible']), description: z.string(), recommendationIds: z.array(z.string()) })),
  missingInformation: z.array(z.object({ field: z.string(), reason: z.string(), blocking: z.boolean() })), questions: z.array(z.object({ id: z.string(), field: z.string(), question: z.string(), type: z.enum(['text', 'number', 'single_choice', 'confirmation']), options: z.array(z.string()) })),
  warnings: z.array(z.string()), assumptions: z.array(z.string()), sources: z.array(z.object({ section: z.string(), field: z.string(), value: z.unknown(), usedFor: z.string() })), confidence: z.number().min(0).max(1),
})
