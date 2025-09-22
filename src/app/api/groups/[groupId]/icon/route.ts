import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/nextauth-server'
import { _DELETE, _GET, _POST } from '@/lib/filesutil'
import { Permission, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  return await _GET('icons', groupId)
}

export async function DELETE(req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      ownerId: true,
      visibility: true,
      editability: true,
    },
  })

  if (!group || group.visibility !== Permission.PUBLIC || group.editability !== Permission.PUBLIC) {
    const user = await requireAuth()
    if (!user || !group || group.ownerId != user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return await _DELETE('icons', groupId)
}

export async function POST(req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      ownerId: true,
      visibility: true,
      editability: true,
    },
  })

  if (!group || group.visibility !== Permission.PUBLIC || group.editability !== Permission.PUBLIC) {
    const user = await requireAuth()
    if (!user || !group || group.ownerId != user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return await _POST({
    form: await req.formData(),
    fileMaxSize: 100 * 1024,
    pathSegments: ['icons'],
    filename: groupId,
    typePrefix: 'image/',
  })
}
