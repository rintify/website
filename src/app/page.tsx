// app/page.tsx
"use client";
import './globals.css';

import { use, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import Button from "@/components/ui/Button";
import { useUser } from '@/hooks/useUser';


export default function HomePage() {
  const user = useUser();
  const [open, setOpen] = useState(false);

  const handleButtonClick = () => {
    if (!user) {
      signOut({ redirect: false }).then(() => window.location.reload());
    } else {
      setOpen(true);
    }
  };

  return (
    <div>
      <h1>hello world</h1>
      <Button onClick={handleButtonClick}>
        {user ? user.nickName : "Sign In"}
      </Button>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      a<br/>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
