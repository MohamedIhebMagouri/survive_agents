import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processData, processView } from '@/lib/bia-backend'
export async function PATCH(request, { params }) { const { id } = await params; const row = await prisma.process.update({ where: { id }, data: processData(await request.json()) }); return NextResponse.json({ data: processView(row) }) }
export async function DELETE(_, { params }) { const { id } = await params; try { await prisma.process.delete({ where: { id } }); return NextResponse.json({ data: { id } }) } catch { return NextResponse.json({ error: 'Impossible de supprimer ce processus' }, { status: 409 }) } }

