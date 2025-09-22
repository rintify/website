// app/components/Textarea.tsx
'use client'
import React, { CSSProperties, TextareaHTMLAttributes, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { useSpring, animated } from '@react-spring/web'
import { EditIcon, ScaleIcon } from '@/icons'
import { useModal } from '@/hooks/ModalContext'

type TextareaProps = {
  value?: string
  onChange?: (value: string) => void
  style?: CSSProperties
  single?: true
  password?: true
  onFocus?: () => void
  onBlur?: () => void
}

const Container = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid #000;
  border-radius: 0px;
  overflow: hidden;
`

const sharedStyle = css`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0.5rem 0.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  background: #0000;
  border: none;
  outline: none;
  caret-color: #000;
  resize: none;
`

const StyledTextarea = styled.textarea`
  ${sharedStyle}
  height: 5.5rem;
`

const StyledInput = styled.input`
  ${sharedStyle}
`
const StyledFullTextarea = styled.textarea`
  ${sharedStyle}
  height: 80vh;
  width: 80vw;
`

const AnimatedContainer = animated(Container)

export default function TextField({ password, single, style, value, onChange, onFocus, onBlur }: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [full, setFull] = useState(false)
  const { pushModal } = useModal()

  const springStyle = useSpring({
    borderColor: focused ? '#000' : '#0003',
    config: { duration: 200 },
  })

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    if (!single && e.key === 'Tab') {
      e.preventDefault()
      const ta = ref.current
      if (!ta) return
      const { selectionStart, selectionEnd, value } = ta
      const before = value.slice(0, selectionStart)
      const after = value.slice(selectionEnd)
      const cursor = selectionStart + 1
      ta.value = before + '\t' + after
      ta.setSelectionRange(cursor, cursor)
    }
  }

  const Modal = () => {
    useEffect(() => {
      setFull(true)
      return () => setFull(false)
    }, [])
    return (
      <StyledFullTextarea
        ref={ref}
        defaultValue={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete='new-password'
      />
    )
  }

  return (
    <AnimatedContainer style={{ ...springStyle, ...style }}>
      {single ? (
        <StyledInput
          ref={ref}
          type={password ? 'password' : 'text'}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => {
            setFocused(true)
            onFocus?.()
          }}
          onBlur={() => {
            setFocused(false)
            onBlur?.()
          }}
          spellCheck={false}
          autoComplete='new-password'
        />
      ) : (
        <>
          <StyledTextarea
            ref={ref}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            onFocus={() => {
              setFocused(true)
              onFocus?.()
            }}
            onBlur={() => {
              setFocused(false)
              onBlur?.()
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete='new-password'
          />
          <ScaleIcon
            onClick={() => {
              pushModal('full', () => <Modal />)
            }}
            style={{ width: '1rem', opacity: 0.5, position: 'absolute', bottom: '0.5rem', right: '0.5rem' }}
          />
        </>
      )}
    </AnimatedContainer>
  )
}
