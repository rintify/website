// app/page.tsx
'use client'

import { signOut } from 'next-auth/react'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/ui/Button'
import { useSessionUser } from "@/lib/api"
import { useModal } from '@/hooks/ModalContext'
import { HeaderMargine } from '@/components/Header'
import { PageBox } from '@/components/ui/Box'
import { delay } from '@/lib/api'

export default function HomePage() {
  const { pushModal } = useModal()

  const handleButtonClick = () => {
  }

  return (
    <PageBox>
      {`コンテンツへとスキップする

`}
    </PageBox>
  )
}
