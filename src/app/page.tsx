// app/page.tsx
"use client";

import { use, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import Button from "@/components/ui/Button";
import { useSessionUser } from "@/lib/api";
import { useModal } from '@/hooks/ModalContext';
import { HeaderMargine } from '@/components/Header';


export default function HomePage() {



  return (
    <div>
      <HeaderMargine/>
      <h1>hello world</h1>
      a<br/>
      a<br/>
      
    </div>
  );
}
