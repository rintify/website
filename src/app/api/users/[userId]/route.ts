
import { NextRequest, NextResponse } from 'next/server'
import { parseRequest, requireAuth } from '@/lib/nextauth-server'
import { PrismaClient } from '@prisma/client'
import { Record, String, Number, Array, Union, Undefined, Object } from 'runtypes'

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: NextParams) {
  const { userId } = await params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      nickName: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user, { status: 200 })
}

const nickNameRegex = /^[^\u0000-\u001f]{1,20}$/
const PachUser = Object({ nickName: Union(String, Undefined), comment: Union(String, Undefined) })

export async function PATCH(req: NextRequest, { params }: NextParams) {
  const { userId } = await params

  const authUser = await requireAuth()
  if (!authUser || authUser.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let { nickName, comment } = (await parseRequest(PachUser, req)) ?? {}

  if (nickName !== undefined) nickName = nickName.trim()

  if (nickName !== undefined && !nickNameRegex.test(nickName)) {
    return NextResponse.json({ error: 'ニックネームは1字以上20字以内の文字列で指定してください' }, { status: 400 })
  }

  if (comment !== undefined && comment.length > 1000) {
    return NextResponse.json({ error: 'コメントは1000字以内の文字列で指定してください' }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickName !== undefined ? { nickName } : {}),
        ...(comment !== undefined ? { comment } : {}),
      },
      select: {
        id: true,
        name: true,
        nickName: true,
        comment: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '更新中にエラーが発生しました' }, { status: 500 })
  }
}
