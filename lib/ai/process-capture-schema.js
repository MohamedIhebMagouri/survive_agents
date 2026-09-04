import { z } from 'zod'

export const processCaptureInputSchema = z.object({
  mode: z.enum(['free_text', 'document', 'guided_form', 'clarification']).default('free_text'),
  text: z.string().max(12000).default(''),
  formData: z.record(z.string(), z.unknown()).default({}),
  document: z.object({ fileName: z.string(), extension: z.string(), truncated: z.boolean().default(false) }).nullable().default(null),
  conversationState: z.object({ draft: z.record(z.string(), z.unknown()).default({}), pendingQuestions: z.array(z.unknown()).default([]) }).nullable().default(null),
})

const fieldSource = z.enum(['user_explicit', 'form_explicit', 'inferred', 'default', 'unresolved'])
const fieldMetadata = z.record(z.string(), z.object({ source: fieldSource, confidence: z.number().min(0).max(1), evidence: z.string().max(500) }))

export const processCaptureOutputSchema = z.object({
  status: z.enum(['needs_questions', 'needs_confirmation', 'ready_to_create', 'error']),
  process: z.object({
    name: z.string().nullable(), description: z.string().nullable(), department: z.string().nullable(), owner: z.string().nullable(),
    location: z.string().nullable(), impact: z.string().nullable(), criticality: z.enum(['Mineur', 'Modéré', 'Majeur', 'Critique']).nullable(),
    rto: z.number().int().nullable(), rpo: z.number().int().nullable(), mtpd: z.number().int().nullable(), mbco: z.number().int().min(0).max(100).nullable(),
    factoryId: z.string().nullable(), factoryReference: z.object({ name: z.string().nullable(), code: z.string().nullable(), location: z.string().nullable() }),
    category: z.enum(['Support', 'Coeur de métier', 'Pilotage']).nullable(), status: z.enum(['Actif', 'Inactif']).nullable(),
  }),
  fieldMetadata,
  missingFields: z.array(z.object({ field: z.string(), requiredForCreation: z.boolean(), reason: z.string() })),
  ambiguities: z.array(z.object({ field: z.string(), candidates: z.array(z.unknown()), reason: z.string() })),
  conflicts: z.array(z.object({ field: z.string(), textValue: z.unknown().nullable(), formValue: z.unknown().nullable(), reason: z.string() })),
  questions: z.array(z.object({ id: z.string(), field: z.string(), question: z.string(), type: z.enum(['text', 'number', 'single_choice', 'confirmation']), options: z.array(z.string()) })).max(5),
  warnings: z.array(z.string()),
  duplicateCandidates: z.array(z.object({ id: z.string(), name: z.string(), factoryId: z.string().nullable(), similarity: z.number().min(0).max(1), reasons: z.array(z.string()) })),
})

export const processDraftSchema = z.object({
  name: z.string().trim().min(1), factoryId: z.string().min(1), department: z.string().trim().min(1), owner: z.string().nullable().optional(),
  description: z.string().nullable().optional(), location: z.string().nullable().optional(), impact: z.string().nullable().optional(),
  criticality: z.enum(['Mineur', 'Modéré', 'Majeur', 'Critique']), rto: z.number().int().positive(), rpo: z.number().int().nonnegative(),
  mtpd: z.number().int().positive(), mbco: z.number().int().min(0).max(100), category: z.enum(['Support', 'Coeur de métier', 'Pilotage']),
  status: z.enum(['Actif', 'Inactif']).nullable().optional(),
})
