import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, parseRequest, checkLimitResponse, checkTextResponse } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Object, String } from 'runtypes'

const prisma = new PrismaClient()

const CreateBody = Object({
  personId: String,
  startTime: String,
  endTime: String,
  comment: String,
})

export async function GET(req: NextRequest, { params }: NextParams) {
  const { timetableId } = await params

  const tt = await prisma.timetable.findUnique({
    where: { id: timetableId },
    select: { id: true },
  })
  if (!tt) return NextResponse.json({ error: 'Timetable not found' }, { status: 404 })

  try {
    const bands = await prisma.timeBand.findMany({
      where: { timeTableId: timetableId },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        comment: true,
        personId: true,
        timeTableId: true,
      },
      orderBy: { startTime: 'asc' },
    })
    return NextResponse.json({ items: bands }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch timebands' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: NextParams) {
  const { timetableId } = await params

  const body = await parseRequest(CreateBody, req)
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  const [tt, person] = await Promise.all([
    prisma.timetable.findUnique({
      where: { id: timetableId },
      select: { id: true, groupId: true },
    }),
    prisma.person.findUnique({
      where: { id: body.personId },
      select: { id: true, groupId: true },
    }),
  ])

  if (!tt) return NextResponse.json({ error: 'Timetable not found' }, { status: 404 })
  if (!person) return NextResponse.json({ error: 'Person not found' }, { status: 404 })
  if (person.groupId !== tt.groupId) {
    return NextResponse.json({ error: 'Person and Timetable must belong to the same group' }, { status: 400 })
  }

  let start = new Date(body.startTime)
  let end = new Date(body.endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: 'Invalid datetime format' }, { status: 400 })
  }
  if (end <= start) {
    ;[end, start] = [start, end]
  }

  let err = await checkLimitResponse('時間帯', 'timeBand', 100, 24 * 2, {
    timeTableId: timetableId,
    personId: person.id,
  })
  if (err) return err

  err = checkTextResponse('コメント', body.comment, 0, 50)
  if (err) return err

  try {
    const created = await prisma.timeBand.create({
      data: {
        timeTableId: timetableId,
        personId: body.personId,
        startTime: start,
        endTime: end,
        comment: body.comment,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        comment: true,
        personId: true,
        timeTableId: true,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create timeband' }, { status: 500 })
  }
}
