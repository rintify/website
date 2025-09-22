import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/nextauth-server'
import { _DELETE, _GET, _POST } from '@/lib/filesutil'
import { Permission, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: NextParams) {
  const { userId } = await params

  return await _GET('icons', userId)
}

export async function DELETE(req: NextRequest, { params }: NextParams) {
  const { userId } = await params

  const user = await requireAuth()
  if (!user || userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return await _DELETE('icons', userId)
}

export async function POST(req: NextRequest, { params }: NextParams) {
  const { userId } = await params

  const user = await requireAuth()
  if (!user || userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return await _POST({
    form: await req.formData(),
    fileMaxSize: 100 * 1024,
    pathSegments: ['icons'],
    filename: userId,
    typePrefix: 'image/'
  })
}

