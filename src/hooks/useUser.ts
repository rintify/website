// src/hooks/useRequiredUser.ts
import { useSession, signIn } from "next-auth/react";
import type { Session } from "next-auth";

export function useUser(): Session["user"] | undefined {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return undefined
  }

  if (status !== "authenticated" || !session?.user) {
    return undefined
  }

  return session.user;
}
