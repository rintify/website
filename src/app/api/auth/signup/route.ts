import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const userNameRegex = /^[0-9a-z_]{3,20}$/;
const passwordRegex = /^[\x21-\x7E]{8,32}$/;

export async function POST(req: Request) {
  const { name, password, comment } = await req.json();
  if (!name || !password) {
    return NextResponse.json({ error: "必須項目が足りません" }, { status: 400 });
  }

  if (!userNameRegex.test(name)) {
    return NextResponse.json(
      { 
        error: "ユーザー名は3〜20文字の半角英数字とアンダースコア（_）のみ使用できます" 
      },
      { status: 400 }
    );
  }

  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      {
        error: "パスワードは英数字・記号で8〜32文字で入力してください",
      },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "このユーザー名は既に使われています" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, passwordHash, comment },
  });
  return NextResponse.json({ id: user.id, name: user.name });
}
