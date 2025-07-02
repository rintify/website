// app/page.tsx
'use client'

import { use, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/ui/Button'
import { useUser } from '@/hooks/useUser'
import { useModal } from '@/hooks/ModalContext'
import { HeaderMargine } from '@/components/Header'
import { PageBox } from '@/components/ui/PageBox'
import Box, { Large, Small } from '@/components/ui/Box'
import TextField from '@/components/ui/Textarea'
import Edit from '@/icons/edit.svg'

export default function HomePage() {
  const user = useUser()
  const { pushModal } = useModal()

  const handleButtonClick = () => {
    if (user) {
      signOut({ redirect: false }).then(() => window.location.reload())
    } else {
      pushModal(() => <AuthModal />)
    }
    return
  }

  return (
    <PageBox>
      <div style={{marginBottom: '2rem'}}>
        <Small>{user && '@' + user.name}</Small>
        <Large style={{marginTop: '0.2rem'}}>{user?.nickName ?? 'ゲスト'}</Large>
      </div>
        ニックネーム
      <TextField single value={user?.nickName}/>
      コメント
      <TextField value={user?.comment}/>
      <Button style={{ alignSelf: 'center', marginTop: '2rem' }} onClick={handleButtonClick}>
        {user ? 'ログアウト' : 'サインイン'}
      </Button>
      <Edit/>
    </PageBox>
  )
}
