import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { name, password, comment } = await req.json();
  if (!name || !password) {
    return NextResponse.json({ error: "必須項目が足りません" }, { status: 400 });
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
