import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gapView } from '@/lib/bia-backend'
export async function GET() { const rows = await prisma.continuityGap.findMany({ orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data: rows.map(gapView) }) }

