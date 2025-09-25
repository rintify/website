import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, $Enums } from '@prisma/client'
import { requireAuth, parseRequest, checkTextResponse, checkLimitResponse, NAME_REGEX } from '@/lib/nextauth-server'
import { Object, String, Union, Undefined } from 'runtypes'

const prisma = new PrismaClient()

const CreateBody = Object({
  name: String,
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const recent = searchParams.get('recent')

  if (q && q.trim().length > 0) {

    try {
      const groups = await prisma.group.findMany({
        where: {
          name: { contains: q.trim() },
          visibility: 'PUBLIC',
        },
        select: { id: true, name: true, comment: true, createdAt: true, visibility: true, editability: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      })
      return NextResponse.json({ items: groups }, { status: 200 })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: '検索に失敗しました' }, { status: 500 })
    }
  } else if (recent === 'true') {
    try {
      const groups = await prisma.group.findMany({
        where: {
          visibility: 'PUBLIC',
        },
        select: { id: true, name: true, comment: true, createdAt: true, visibility: true, editability: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      })
      return NextResponse.json({ items: groups }, { status: 200 })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
    }
  } else {

    const user = await requireAuth()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      const groups = await prisma.group.findMany({
        where: { ownerId: user.id },
        select: { id: true, name: true, comment: true, createdAt: true, visibility: true, editability: true },
        orderBy: { createdAt: 'asc' },
      })
      return NextResponse.json({ items: groups }, { status: 200 })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
    }
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await parseRequest(CreateBody, req)
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })

  let err = checkTextResponse('グループ名', body.name, 1, 20, NAME_REGEX, true)
  if (err) return err


  err = await checkLimitResponse('グループ', 'group', 5, 24 * 21, { ownerId: user.id })
  if (err) return err

  try {
    const created = await prisma.group.create({
      data: {
        ownerId: user.id,
        name: body.name,
      },
      select: { id: true, name: true, comment: true, createdAt: true, visibility: true, editability: true },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
