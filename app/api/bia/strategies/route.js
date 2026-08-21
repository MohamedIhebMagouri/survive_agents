import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { strategyData, strategyView } from '@/lib/bia-backend'
export async function GET() { const rows = await prisma.continuityStrategy.findMany({ orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data: rows.map(strategyView) }) }
export async function POST(request) { try { const body = await request.json(); if (!body.name || !body.processId) return NextResponse.json({ error: 'Nom et processus requis' }, { status: 400 }); const row = await prisma.continuityStrategy.create({ data: strategyData(body) }); return NextResponse.json({ data: strategyView(row) }, { status: 201 }) } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) } }

