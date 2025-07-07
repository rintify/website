// app/components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Box, { Large, ModalBox } from './ui/Box'
import Button from './ui/Button'
import TextField from './ui/Textarea'
import { useModal } from '@/hooks/ModalContext'

export default function AuthModal() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [comment, setComment] = useState('')
  const {popModal} = useModal()

  const handleSubmit = async () => {
    const resCheck = await fetch('/api/auth/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const { exists } = await resCheck.json()

    if (!exists) {
      if (!confirm('ユーザ名が見つかりません。新規登録しますか？')) return
      const resSignUp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, comment }),
      })
      if (!resSignUp.ok) {
        const body = await resSignUp.json()
        return body.error || '登録に失敗しました'
      }
    }

    const signInRes = await signIn('credentials', {
      redirect: false,
      name,
      password,
    })
    if (signInRes?.error) {
      return '認証に失敗しました。名前またはパスワードを確認してください。'
    } else {
      popModal('auth')
    }
  }

  return (
    <ModalBox title='ログイン・新規登録' handleOK={handleSubmit}>
      ユーザ ID
      <TextField single value={name} onChange={e => setName(e)} />
      パスワード
      <TextField single password value={password} onChange={e => setPassword(e)} />
    </ModalBox>
  )
}
