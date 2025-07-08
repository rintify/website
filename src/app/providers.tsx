// app/providers.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";

export default function Providers({ children }: { children: ReactNode }) {
  
  return (
    <SessionProvider>
          {children}
    </SessionProvider>
  );
}
