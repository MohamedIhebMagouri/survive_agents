import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reportView, systemUserId } from '@/lib/bia-backend'
import { randomUUID } from 'node:crypto'
export async function GET() { const rows = await prisma.biaReport.findMany({ orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data: rows.map(reportView) }) }
export async function POST(request) { try { const body = await request.json(); if (!body.processId) return NextResponse.json({ error: 'Processus requis' }, { status: 400 }); const row = await prisma.biaReport.create({ data: { name: `BIA ${body.processName || body.processId}`, description: body.objective || null, format: 'JSON', status: 'GENERATED', totalProcesses: 1, continuityLevel: Number(body.globalScore || 0), recommendationCount: body.recommendations?.length || 0, reportData: body, includedProcessIds: [body.processId], factoryId: body.factoryId || null, authorId: await systemUserId(), shareToken: randomUUID() } }); return NextResponse.json({ data: reportView(row) }, { status: 201 }) } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) } }
