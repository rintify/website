import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, parseRequest, checkLimitResponse, checkTextResponse, NAME_REGEX } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Object, String } from 'runtypes'
import { group } from 'console'

const prisma = new PrismaClient()

const CreateBody = Object({
  name: String,
})

export async function GET(req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, ownerId: true },
  })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  try {
    const persons = await prisma.person.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ items: persons }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch persons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: NextParams) {
  const { groupId } = await params

  const body = await parseRequest(CreateBody, req)
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, ownerId: true },
  })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  let err = await checkLimitResponse('パーソン', 'person', 100, 24 * 21, { groupId: group.id })
  if (err) return err

  err = checkTextResponse('パーソン名', body.name, 1, 20, NAME_REGEX)
  if (err) return err

  try {
    const created = await prisma.person.create({
      data: { groupId, name: body.name, comment: '' },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 })
  }
}
