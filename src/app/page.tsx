// app/page.tsx
"use client";

import { use, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import Button from "@/components/ui/Button";
import { useUser } from '@/hooks/useUser';
import { useModal } from '@/hooks/ModalContext';
import { HeaderMargine } from '@/components/Header';


export default function HomePage() {
  const user = useUser();
  const {pushModal} = useModal()

  const handleButtonClick = () => {
    pushModal(() => <AuthModal/>)
    return
    if (!user) {
      signOut({ redirect: false }).then(() => window.location.reload());
    } else {
      
    }
  };

  return (
    <div>
      <HeaderMargine/>
      <h1>hello world</h1>
      <Button onClick={handleButtonClick}>
        {user ? user.nickName : "Sign In"}
      </Button>
      a<br/>
      a<br/>
      
    </div>
  );
}
