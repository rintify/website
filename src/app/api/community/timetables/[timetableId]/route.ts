import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, parseRequest, checkTextResponse } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Object, String, Union, Undefined } from 'runtypes'

const prisma = new PrismaClient()

const PatchBody = Object({
  name: Union(String, Undefined),
  comment: Union(String, Undefined),
})

export async function PATCH(req: NextRequest, { params }: NextParams) {
  const { timetableId } = await params

  const body = await parseRequest(PatchBody, req)
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  const t = await prisma.timetable.findUnique({
    where: { id: timetableId },
    select: { id: true },
  })
  if (!t) return NextResponse.json({ error: 'Timetable not found' }, { status: 404 })

  let err = checkTextResponse('タイムテーブル名', body.name, 1, 20)
  if (err) return err

  err = checkTextResponse('コメント', body.comment, 0, 50)
  if (err) return err

  try {
    const updated = await prisma.timetable.update({
      where: { id: timetableId },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.comment !== undefined ? { comment: body.comment } : {}),
      },
      select: { id: true, name: true, comment: true },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update timetable' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: NextParams) {
  const { timetableId } = await params

  const t = await prisma.timetable.findUnique({
    where: { id: timetableId },
    select: { id: true, group: { select: { ownerId: true } } },
  })
  if (!t) return NextResponse.json({ error: 'Timetable not found' }, { status: 404 })

  try {
    await prisma.timetable.delete({ where: { id: timetableId } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete timetable' }, { status: 500 })
  }
}
