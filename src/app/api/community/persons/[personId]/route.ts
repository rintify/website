import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, parseRequest, checkTextResponse, NAME_REGEX } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Object, String, Union, Undefined } from 'runtypes'

const prisma = new PrismaClient()

const PatchBody = Object({
  name: Union(String, Undefined),
  comment: Union(String, Undefined),
})

export async function PATCH(req: NextRequest, { params }: NextParams) {
  const { personId } = await params

  const body = await parseRequest(PatchBody, req)
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  })
  if (!person) return NextResponse.json({ error: 'Person not found' }, { status: 404 })

  let err = checkTextResponse('パーソン名', body.name, 0, 20, NAME_REGEX)
  if (err) return err

  err = checkTextResponse('コメント', body.comment, 0, 100)
  if (err) return err

  try {
    const updated = await prisma.person.update({
      where: { id: personId },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.comment !== undefined ? { comment: body.comment } : {}),
      },
      select: { id: true, name: true, comment: true },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: NextParams) {
  const { personId } = await params

  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  })
  if (!person) return NextResponse.json({ error: 'Person not found' }, { status: 404 })

  try {
    await prisma.person.delete({ where: { id: personId } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 })
  }
}
