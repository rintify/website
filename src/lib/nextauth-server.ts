// lib/nextauth-server.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../app/api/auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'
import { Object } from 'runtypes'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) return

  return session.user
}

export async function parseRequest<O extends Object.Fields = Object.Fields>(schema: Object<O>, req: NextRequest) {
  try {
    return schema.check(await req.json())
  } catch {
    return
  }
}

type ModelKeys = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: (...args: any) => any } ? K : never
}[keyof PrismaClient]

type WhereInput<M extends ModelKeys> = NonNullable<Prisma.Args<PrismaClient[M], 'findMany'>['where']>

export async function checkLimitResponse<M extends ModelKeys>(
  what: string,
  modelName: M,
  limit: number,
  hoursAgo: number = 24,
  extraWhere: WhereInput<M>
) {
  const since = new Date()
  since.setHours(since.getHours() - hoursAgo)

  const count = await (prisma[modelName] as any).count({
    where: {
      ...(extraWhere ?? {}),
      createdAt: {
        gte: since,
        lte: new Date(),
      },
    },
  })

  if (count >= limit) {
    let periodLabel: string
    if (hoursAgo >= 24 * 7) {
      const weeks = Math.floor(hoursAgo / (24 * 7))
      periodLabel = `${weeks}週間`
    } else if (hoursAgo >= 24) {
      const days = Math.floor(hoursAgo / 24)
      periodLabel = `${days}日`
    } else {
      periodLabel = `${hoursAgo}時間`
    }

    return NextResponse.json(
      {
        error: `${periodLabel}の${what}作成上限に達しました`,
      },
      { status: 429 }
    )
  }
  return
}

export const NAME_REGEX = /^[^\\u0000-\\u001f]*$/
export function checkTextResponse(
  what: string,
  value: string | undefined,
  minLen: number,
  maxLen: number,
  re?: RegExp
) {
  if (value === undefined || (value.length >= minLen && value.length <= maxLen && (!re || re.test(value)))) return
  return NextResponse.json(
    { error: `${what}は${minLen}字以上${maxLen}字以内の文字列で指定してください` },
    { status: 400 }
  )
}
