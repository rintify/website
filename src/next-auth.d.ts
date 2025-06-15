// next-auth.d.ts
import { User as PrismaUser } from "@prisma/client";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";


type SessionUser = Record<"id"
  | "name"
  | "nickName"
  | "createdAt"
  | "updatedAt",string>

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User extends SessionUser, DefaultUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends SessionUser, DefaultJWT {}
}
