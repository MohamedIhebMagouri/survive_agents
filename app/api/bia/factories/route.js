import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { factoryData, factoryView, systemUserId } from '@/lib/bia-backend'

export async function GET() { const rows = await prisma.factory.findMany({ include: { manager: true }, orderBy: { name: 'asc' } }); return NextResponse.json({ data: rows.map(factoryView) }) }
export async function POST(request) { try { const body = await request.json(); if (!body.name || !body.code) return NextResponse.json({ error: 'Nom et code requis' }, { status: 400 }); const row = await prisma.factory.create({ data: factoryData(body, await systemUserId()), include: { manager: true } }); return NextResponse.json({ data: factoryView(row) }, { status: 201 }) } catch (error) { return NextResponse.json({ error: error.code === 'P2002' ? 'Ce code existe déjà' : error.message }, { status: 400 }) } }

