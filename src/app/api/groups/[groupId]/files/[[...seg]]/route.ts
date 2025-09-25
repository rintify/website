import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/nextauth-server'
import { _DELETE, _GET, _POST } from '@/lib/filesutil'
import { Permission, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
type Params = NextParams<{ groupId: string; seg?: string[] }>

export async function GET(req: NextRequest, { params }: Params) {
  const { groupId, seg } = await params

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      ownerId: true,
      visibility: true,
    },
  })

  if (!group || group.visibility !== Permission.PUBLIC) {
    const user = await requireAuth()
    if (!user || !group || group.ownerId != user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return await _GET('groups', groupId, ...(seg?.map(s => decodeURIComponent(s)) ?? []))
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { groupId, seg } = await params

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

  return await _DELETE('groups', groupId, ...(seg?.map(s => decodeURIComponent(s)) ?? []))
}

export async function POST(req: NextRequest, { params }: Params) {
  const { groupId, seg } = await params

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
    dirMaxSize: 5 * 1024 * 1024,
    fileMaxSize: 5 * 1024 * 1024,
    pathSegments: ['groups', groupId, ...(seg?.map(s => decodeURIComponent(s)) ?? [])],
  })
}
