import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processData, processView } from '@/lib/bia-backend'
import { validateProcessPayload } from '@/lib/validation/process-validation'
export async function PATCH(request, { params }) { const { id } = await params; const body = await request.json(); const factory = await prisma.factory.findUnique({ where: { id: body.factoryId } }); const validation = validateProcessPayload(body, factory); if (!validation.valid) return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 }); const row = await prisma.process.update({ where: { id }, data: processData(body) }); return NextResponse.json({ data: processView(row) }) }
export async function DELETE(_, { params }) { const { id } = await params; try { await prisma.process.delete({ where: { id } }); return NextResponse.json({ data: { id } }) } catch { return NextResponse.json({ error: 'Impossible de supprimer ce processus' }, { status: 409 }) } }

