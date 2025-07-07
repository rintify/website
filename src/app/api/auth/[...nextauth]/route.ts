// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "NameLogin",
      credentials: {
        name:     { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { name: credentials.name },
        });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id:         user.id,
          name:       user.name,
          nickName:   user.nickName,
          createdAt:  user.createdAt.toISOString(),
          updatedAt:  user.updatedAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, {
          id:         user.id,
          name:       user.name,
          nickName:   user.nickName,
          createdAt:  user.createdAt,
          updatedAt:  user.updatedAt,
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id:         token.id,
        name:       token.name!,
        nickName:   token.nickName,
        createdAt:  token.createdAt,
        updatedAt:  token.updatedAt,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
