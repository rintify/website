import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, parseRequest } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Object, String, Union, Undefined } from 'runtypes'

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest, { params }: NextParams) {
  const { timeBandId } = await params

  const tb = await prisma.timeBand.findUnique({
    where: { id: timeBandId },
    select: { id: true },
  })
  if (!tb) return NextResponse.json({ error: 'TimeBand not found' }, { status: 404 })

  try {
    await prisma.timeBand.delete({ where: { id: timeBandId } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete timeband' }, { status: 500 })
  }
}
