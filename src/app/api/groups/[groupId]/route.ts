import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth, parseRequest, checkTextResponse } from '@/lib/nextauth-server'
import { Object, String, Union, Undefined } from 'runtypes'

const prisma = new PrismaClient()

const PatchBody = Object({
  name: Union(String, Undefined),
  comment: Union(String, Undefined),
})

type NextParams = { params: Promise<{ groupId: string }> }

export async function GET(_req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  try {
    const g = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        comment: true,
        createdAt: true,
      },
    })
    return NextResponse.json(g, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await parseRequest(PatchBody, req)
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, ownerId: true },
  })
  if (!group) return NextResponse.json({ error: 'Group Not Found' }, { status: 401 })
  if (group.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 401 })

  let err = checkTextResponse('グループ名', body.name, 1, 20)
  if (err) return err

  err = checkTextResponse('コメント', body.comment, 0, 100)
  if (err) return err

  try {
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.comment !== undefined ? { comment: body.comment } : {}),
      },
      select: { id: true, name: true, comment: true },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, ownerId: true },
  })
  if (!group) return NextResponse.json({ error: 'Group Not Found' }, { status: 401 })
  if (group.ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 401 })

  try {
    await prisma.group.delete({ where: { id: groupId } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
