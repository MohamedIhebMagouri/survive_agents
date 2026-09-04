import { z } from 'zod'
import { Type } from '@google/genai'

export const extractionFields = ['name', 'description', 'department', 'owner', 'location', 'impact', 'criticality', 'rto', 'rpo', 'mtpd', 'mbco', 'category', 'status']

export const extractionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, nullable: true },
    description: { type: Type.STRING, nullable: true },
    department: { type: Type.STRING, nullable: true },
    owner: { type: Type.STRING, nullable: true },
    location: { type: Type.STRING, nullable: true },
    impact: { type: Type.STRING, nullable: true },
    criticality: { type: Type.STRING, nullable: true, enum: ['Mineur', 'Modéré', 'Majeur', 'Critique'] },
    rto: { type: Type.INTEGER, nullable: true },
    rpo: { type: Type.INTEGER, nullable: true },
    mtpd: { type: Type.INTEGER, nullable: true },
    mbco: { type: Type.INTEGER, nullable: true },
    category: { type: Type.STRING, nullable: true, enum: ['Support', 'Coeur de métier', 'Pilotage'] },
    status: { type: Type.STRING, nullable: true, enum: ['Actif', 'Inactif'] },
  },
  required: extractionFields,
}

export const extractedFieldsSchema = z.object({
  name: z.string().nullable(), description: z.string().nullable(), department: z.string().nullable(), owner: z.string().nullable(),
  location: z.string().nullable(), impact: z.string().nullable(), criticality: z.enum(['Mineur', 'Modéré', 'Majeur', 'Critique']).nullable(),
  rto: z.number().int().nullable(), rpo: z.number().int().nullable(), mtpd: z.number().int().nullable(), mbco: z.number().int().min(0).max(100).nullable(),
  category: z.enum(['Support', 'Coeur de métier', 'Pilotage']).nullable(), status: z.enum(['Actif', 'Inactif']).nullable(),
})
