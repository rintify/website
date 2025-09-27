import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, $Enums, Prisma } from '@prisma/client'
import { requireAuth, parseRequest, checkTextResponse, checkLimitResponse, NAME_REGEX } from '@/lib/nextauth-server'
import { Object, String, Union, Undefined } from 'runtypes'

const prisma = new PrismaClient()

const CreateBody = Object({
  name: String,
})

export async function GET(req: NextRequest) {
  const url = req.nextUrl
  const paramsStr = url.searchParams.get('params')
  const params = paramsStr ? JSON.parse(paramsStr) : {}
  const query = params.query?.trim()
  const joinOnly = params.joinOnly === true
  const user = await requireAuth()

  console.log(query, joinOnly, !!user)

  try {
    const where: Prisma.GroupWhereInput = {}

    if (user) {
      where.OR = [
        { searchable: $Enums.Permission.PUBLIC },
        { ownerId: user.id }
      ]
    } else {
      where.searchable = $Enums.Permission.PUBLIC
    }

    if (query) {
      where.name = { contains: query }
    }

    if (joinOnly && user) {
      where.ownerId = user.id
    }

    const groups = await prisma.group.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    return NextResponse.json({ items: groups }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
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
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
