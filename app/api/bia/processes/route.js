import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processData, processView } from '@/lib/bia-backend'
import { validateProcessPayload } from '@/lib/validation/process-validation'
export async function GET() { const rows = await prisma.process.findMany({ orderBy: { name: 'asc' } }); return NextResponse.json({ data: rows.map(processView) }) }
export async function POST(request) { try { const body = await request.json(); const factory = await prisma.factory.findUnique({ where: { id: body.factoryId } }); const validation = validateProcessPayload(body, factory); if (!validation.valid) return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 }); const row = await prisma.process.create({ data: processData(body) }); return NextResponse.json({ data: processView(row) }, { status: 201 }) } catch (error) { return NextResponse.json({ error: 'Impossible de créer le processus' }, { status: 400 }) } }

