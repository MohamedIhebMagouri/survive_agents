import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processData, processView } from '@/lib/bia-backend'
export async function GET() { const rows = await prisma.process.findMany({ orderBy: { name: 'asc' } }); return NextResponse.json({ data: rows.map(processView) }) }
export async function POST(request) { try { const body = await request.json(); if (!body.name || !body.factoryId) return NextResponse.json({ error: 'Nom et usine requis' }, { status: 400 }); const row = await prisma.process.create({ data: processData(body) }); return NextResponse.json({ data: processView(row) }, { status: 201 }) } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) } }

