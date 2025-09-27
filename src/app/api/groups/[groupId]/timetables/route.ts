import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, parseRequest, checkLimitResponse, checkTextResponse } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Object, String } from 'runtypes'

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
    const timetables = await prisma.timetable.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ items: timetables }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch timetables' }, { status: 500 })
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

  let err = await checkLimitResponse('タイムテーブル', 'timetable', 10, 24 * 2, { groupId: group.id })
  if (err) return err

  err = checkTextResponse('タイムテーブル名', body.name, 1, 20)
  if (err) return err

  try {
    const created = await prisma.timetable.create({
      data: { groupId, name: body.name, comment: '' },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create timetable' }, { status: 500 })
  }
}
