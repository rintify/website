// app/components/AuthModal.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Box from './ui/Box'
import Button from './ui/Button'
import TextField from './ui/Textarea'

export default function AuthModal() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')

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
        setError(body.error || '登録に失敗しました')
        return
      }
    }

    const signInRes = await signIn('credentials', {
      redirect: false,
      name,
      password,
    })
    if (signInRes?.error) {
      setError('認証に失敗しました。名前またはパスワードを確認してください。')
    } else {
      window.location.reload()
    }
  }

  return (
    <Box style={{ width: '20rem' }}>
      <h2>サインイン</h2>
      <Box style={{ color: 'red' }}>{error}</Box>
      ユーザ ID
      <TextField single value={name} onChange={e => setName(e)} />
      パスワード
      <TextField single password value={password} onChange={e => setPassword(e)} />
      <Box row style={{marginTop: '1rem', justifyContent: 'flex-end'}}>
        <Button onClick={handleSubmit}>OK</Button>
      </Box>
    </Box>
  )
}
