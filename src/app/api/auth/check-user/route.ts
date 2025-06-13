import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ exists: false });
  const user = await prisma.user.findUnique({ where: { name } });
  return NextResponse.json({ exists: !!user });
}
