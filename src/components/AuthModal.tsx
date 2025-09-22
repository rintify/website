// app/components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Box, { Large, ModalBox } from './ui/Box'
import Button from './ui/Button'
import TextField from './ui/Textarea'
import { useModal } from '@/hooks/ModalContext'
import { fetchFile, uploadUserIcon, signUp, signInUser } from '@/lib/api/user'
import { createGroup, uploadGroupIcon } from '@/lib/api/group'

export default function AuthModal() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [comment, setComment] = useState('')
  const { popModal } = useModal()

  const handleSubmit = async () => {
    const resCheck = await fetch('/api/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const { exists } = await resCheck.json()

    if (exists) {
      const signInResult = await signInUser(name, password)
      if (!signInResult.ok) return signInResult.error
      popModal('auth')
      return
    }

    if (!confirm('ユーザ名が見つかりません。新規登録しますか？')) return

    const signUpResult = await signUp(name, password, comment)
    if (!signUpResult.ok) return signUpResult.error

    const signInResult = await signInUser(name, password)
    if (!signInResult.ok) return signInResult.error

    const icon = await fetchFile('/default_icon.png')

    createGroup(signUpResult.user?.name ?? 'グループ').then(res => uploadGroupIcon(res.group?.id, icon))
    await uploadUserIcon(signUpResult.user?.id, icon)

    popModal('auth')
    window.location.reload()
  }

  return (
    <ModalBox title='ログイン・新規登録' actions={handleSubmit}>
      ユーザ ID
      <TextField single value={name} onChange={e => setName(e)} />
      パスワード
      <TextField single password value={password} onChange={e => setPassword(e)} />
    </ModalBox>
  )
}
