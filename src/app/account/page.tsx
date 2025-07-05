// app/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/ui/Button'
import { useSessionUser } from '@/lib/api'
import { useModal } from '@/hooks/ModalContext'
import { HeaderMargine } from '@/components/Header'
import { Medium, ModalBox, PageBox, ProfileTable } from '@/components/ui/Box'
import Box, { Large, Small } from '@/components/ui/Box'
import TextField from '@/components/ui/Textarea'
import { EditIcon } from '@/icons'
import { useUser } from '@/lib/api'
import { LoadingBar, LoadingCover } from '@/components/ui/LoadingBar'
import { MarkdownBox } from '@/components/ui/Markdown'
import { formatJapaneseDate } from '@/lib/util'

export default function HomePage() {
  const { session, sessionLoading } = useSessionUser()
  const { pushModal } = useModal()

  const { user, userLoading, mutate } = useUser(session?.id)

  const handleAuth = () => {
    if (session) {
      signOut({ redirect: false })
    } else {
      pushModal('auth', () => <AuthModal />)
    }
    return
  }

  const handleEditButton = () => {
    pushModal('editUser', () => <EditModal />)
  }

  useEffect(() => {
    if(!sessionLoading && !userLoading && !user) pushModal('auth', () => <AuthModal />)
  },[userLoading, sessionLoading, user])

  return (
    <PageBox>
      <div style={{ marginBottom: '2rem' }}>
        <Box row>
          <Large style={{ marginTop: '0.2rem', backgroundColor: '' }}>{user?.nickName ?? 'ゲスト'}</Large>
          <EditIcon onClick={handleEditButton} style={{ backgroundColor: '', marginTop: '0.5rem' }} />
        </Box>
        <Small>ID: {user ? '@' + user.name : 'なし'}</Small>
      </div>

      <ProfileTable style={{marginBottom: '2rem'}}>
        作成日
        {user ? formatJapaneseDate(user.createdAt) : 'なし'}
        更新日
        {user ? formatJapaneseDate(user.updatedAt): 'なし'}
      </ProfileTable>

      <MarkdownBox content={user?.comment ?? ''} />

      <Button style={{ alignSelf: 'center', marginTop: '2rem' }} onClick={handleAuth}>
        {user ? 'ログアウト' : 'サインイン'}
      </Button>
      <LoadingCover progress={userLoading !== 'loading' && !sessionLoading} message='ユーザ情報取得中' />
    </PageBox>
  )
}

const EditModal = () => {
  const { session } = useSessionUser()
  const { popModal } = useModal()
  const { user, userLoading, mutate } = useUser(session?.id)

  const [nickName, setNickName] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) return
    ;(setNickName(user.nickName), setComment(user.comment))
  }, [user])

  const handleSubmit = async () => {
    if (!session || !user) {
      setStatus('サインインしてください')
      return
    }

    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickName, comment }),
    })

    const data = await res.json()

    if (res.ok) {
      mutate?.()
      popModal('editUser')
    } else {
      setStatus(data.error)
    }
  }

  return (
    <ModalBox title='ユーザ編集' handleOK={handleSubmit} error={status}>
      ニックネーム
      <TextField single value={nickName} onChange={e => setNickName(e)} />
      コメント
      <TextField value={comment} onChange={e => setComment(e)} />
      <LoadingCover progress={!userLoading} message={'ユーザ情報取得中'} />
    </ModalBox>
  )
}
