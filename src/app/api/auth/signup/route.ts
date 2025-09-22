import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const userNameRegex = /^[0-9a-z_]{3,10}$/
const passwordRegex = /^[\x21-\x7E]{8,32}$/
const DAILY_LIMIT = 10

export async function POST(req: Request) {
  const { name, password, comment } = await req.json()

  if (!name || !password) {
    return NextResponse.json({ error: '必須項目が足りません' }, { status: 400 })
  }

  if (!userNameRegex.test(name)) {
    return NextResponse.json(
      {
        error: 'ユーザー名は3〜10文字の半角英数字とアンダーバーのみ使用できます',
      },
      { status: 400 }
    )
  }

  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      {
        error: 'パスワードは英数字・記号で8〜32文字で入力してください',
      },
      { status: 400 }
    )
  }

  const exists = await prisma.user.findUnique({ where: { name } })
  if (exists) {
    return NextResponse.json({ error: 'このユーザー名は既に使われています' }, { status: 409 })
  }

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const todayCount = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: new Date(),
      },
    },
  })

  if (todayCount >= DAILY_LIMIT) {
    return NextResponse.json({ error: '本日のアカウント作成上限に達しました' }, { status: 429 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, passwordHash, comment, nickName: name },
  })
  return NextResponse.json({ id: user.id, name: user.name })
}
