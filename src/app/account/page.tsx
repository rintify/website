// app/page.tsx
'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/ui/Button'
import { delay, uploadFile, useSessionUser } from '@/lib/api'
import { useModal } from '@/hooks/ModalContext'
import { HeaderMargine } from '@/components/Header'
import { Medium, ModalBox, PageBox, ProfileTable } from '@/components/ui/Box'
import Box, { Large, Small } from '@/components/ui/Box'
import TextField from '@/components/ui/Textarea'
import { EditIcon } from '@/icons'
import { useUser } from '@/lib/api'
import { LoadingCover } from '@/components/ui/LoadingBar'
import { MarkdownBox } from '@/components/ui/Markdown'
import { formatJapaneseDate } from '@/lib/util'
import { UserIcon } from '@/components/Components'
import ButtonDiv from '@/components/ui/TextButton'
import { FileBox } from '@/components/ui/FileBox'
import imageCompression from 'browser-image-compression'

export default function HomePage() {
  const { session, sessionLoading } = useSessionUser()
  const { pushModal, popModal } = useModal()

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
    if (!sessionLoading && !userLoading && !user) pushModal('auth', () => <AuthModal />)
  }, [userLoading, sessionLoading, user])

  function IconModal() {
    const [iconFile, setIconFile] = useState<File | undefined>()
    const [progress, setProgress] = useState(1)
    return (
      <ModalBox
        title='アイコン'
        actions={async () => {
          if (!session) return 'ログインしてください'
          setProgress(0)
          let res
          if (iconFile) {
            let compressedFile = iconFile
            try {
              for (let i = 0; i < 5; i++) {
                compressedFile = await imageCompression(compressedFile, {
                  onProgress: a => setProgress(0.9*a/100),
                  maxSizeMB: 0.05,
                  maxWidthOrHeight: 256 ,
                  useWebWorker: true,
                })
                if (compressedFile.size <= 50*1024) break
              }
            } catch {
              setProgress(1)
              return '画像ファイルを指定してください'
            }
            res = await uploadFile(session?.id, 'icons', compressedFile)
            setProgress(1)
            if (!res.ok) return res.error
          }

          popModal('icon')
          if(res?.ok) window.location.reload()
        }}
      >
        <FileBox
          files={iconFile}
          fullDrop
          style={{ alignSelf: 'center', width: '15rem', height: '8rem' }}
          onChange={files => setIconFile(files[0])}
        />
        <LoadingCover list={[{progress: progress, message: '画像を圧縮中'}]} />
      </ModalBox>
    )
  }

  console.log('fff')

  return (
    <PageBox>
      <Box row style={{ marginBottom: '2rem' }}>
        <ButtonDiv scaleRatio={0.5} onClick={() => pushModal('icon', () => <IconModal />)}>
          <UserIcon userId={session?.id} style={{ width: '6rem', height: '6rem ' }} />
        </ButtonDiv>
        <div>
          <Box row>
            <Large>{user?.nickName ?? 'ゲスト'}</Large>
            <EditIcon onClick={handleEditButton} style={{ backgroundColor: '', marginTop: '0.5rem' }} />
          </Box>
          <Small>ID: {user ? '@' + user.name : 'なし'}</Small>
        </div>
      </Box>

      <ProfileTable style={{ marginBottom: '2rem' }}>
        作成日
        {user ? formatJapaneseDate(user.createdAt) : 'なし'}
        更新日
        {user ? formatJapaneseDate(user.updatedAt) : 'なし'}
      </ProfileTable>

      <MarkdownBox content={user?.comment ?? ''} />

      <Button style={{ alignSelf: 'center', marginTop: '2rem' }} onClick={handleAuth}>
        {user ? 'ログアウト' : 'ログイン・新規登録'}
      </Button>
      <LoadingCover list={[{progress: userLoading !== 'loading' && !sessionLoading, message: 'ユーザ情報取得中'}]} />
    </PageBox>
  )
}

const EditModal = () => {
  const { session } = useSessionUser()
  const { popModal } = useModal()
  const { user, userLoading, mutate } = useUser(session?.id)

  const [nickName, setNickName] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!user) return
    ;(setNickName(user.nickName), setComment(user.comment))
  }, [user])

  const handleSubmit = async () => {
    if (!session || !user) return 'ログインしてください'

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
      return data.error
    }
  }

  return (
    <ModalBox title='ユーザ編集' actions={handleSubmit}>
      ニックネーム
      <TextField single value={nickName} onChange={e => setNickName(e)} />
      コメント
      <TextField value={comment} onChange={e => setComment(e)} />
      <LoadingCover list={[{progress: userLoading != 'loading', message: 'ユーザ情報取得中'}]}/>
    </ModalBox>
  )
}
