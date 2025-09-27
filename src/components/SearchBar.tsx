'use client'

import React, { useState, useEffect } from 'react'
import { LoupeIcon } from '@/icons'
import Textarea from '@/components/Textarea'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue)
    }, 1000)

    return () => clearTimeout(timer)
  }, [inputValue, onChange])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: '0.5rem',
      width: '20rem'
    }}>
      <LoupeIcon/>
      <Textarea single value={inputValue} onChange={setInputValue} placeholder={placeholder} />
    </div>
  )
}