import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { factoryData, factoryView } from '@/lib/bia-backend'
export async function PATCH(request, { params }) { const { id } = await params; const row = await prisma.factory.update({ where: { id }, data: factoryData(await request.json()), include: { manager: true } }); return NextResponse.json({ data: factoryView(row) }) }
export async function DELETE(_, { params }) { const { id } = await params; try { await prisma.factory.delete({ where: { id } }); return NextResponse.json({ data: { id } }) } catch { return NextResponse.json({ error: 'Impossible de supprimer une usine utilisée' }, { status: 409 }) } }

