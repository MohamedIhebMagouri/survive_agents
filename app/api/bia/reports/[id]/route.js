import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reportView } from '@/lib/bia-backend'
export async function GET(_, { params }) { const { id } = await params; const row = await prisma.biaReport.findUnique({ where: { id } }); if (!row) return NextResponse.json({ error: 'BIA introuvable' }, { status: 404 }); return NextResponse.json({ data: reportView(row) }) }
