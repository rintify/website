// app/page.tsx
"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const handleButtonClick = () => {
    if (status === "authenticated") {
      signOut({ redirect: false }).then(() => window.location.reload());
    } else {
      setOpen(true);
    }
  };

  return (
    <div>
      <h1>hello world</h1>
      <Button onClick={handleButtonClick}>
        {status === "authenticated" ? session.user?.name : "Sign In"}
      </Button>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
