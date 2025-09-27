// app/components/Box.tsx
'use client'
import React, { CSSProperties, FC, HTMLAttributes, HTMLProps, JSX, ReactNode, useState } from 'react'
import styled from 'styled-components'
import Button from './Button'
import { useModal } from '@/hooks/ModalContext'
import { useSpring, animated } from '@react-spring/web'
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion'

type BoxProps = {
  row?: boolean
  children: ReactNode
  style?: React.CSSProperties
}

export default function Box({ row, children, style = {} }: BoxProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: row ? 'row' : 'column',
        alignItems: row ? 'center' : 'flex-start',
        gap: '0.5rem',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const Large = styled.div`
  font-size: 1.8rem;
  color: #000;
  line-height: 1.2;
  min-height: 1.2em;
`

export const Medium = styled.div`
  font-size: 1.3rem;
  color: #000;
  line-height: 1.2;
  min-height: 1.2em;
`

export const Small = styled.div`
  font-size: 0.8rem;
  color: #0008;
  line-height: 1.2;
  min-height: 1.2em;
`

export const Line = styled.div`
  background-color: #000;
  height: 1px;
  width: 100%;
`

type ModalAction = { text: string; on: (ctx: ReturnType<typeof useModal>) => Promise<void | string> }
export const ModalBox: React.FC<{
  children: ReactNode
  style?: CSSProperties
  title: ReactNode
  actions: ModalAction[] | ModalAction | ModalAction['on']
}> = ({ title, style, children, actions }) => {
  const [error, setError] = useState<string>('')
  const ctx = useModal()

  if (typeof actions === 'function') actions = [{ text: 'OK', on: actions }]
  else if (!Array.isArray(actions)) actions = [actions]

  return (
    <Box style={{ width: '20rem', ...style }}>
      <Large style={{ fontSize: '1.5rem' }}>{title}</Large>
      <Box
        style={{ color: 'red', marginBottom: '0.8rem', height: error ? '1.2em' : '0', transition: 'height ease 0.2s' }}
      >
        {error ?? ''}
      </Box>
      {children}
      {actions.length === 0 ? undefined : (
        <Box row style={{ width: '100%', marginTop: '1rem', justifyContent: 'flex-end', flexDirection: 'row' }}>
          {actions.map((a, i) => {
            return (
              <Button
                key={i}
                onClick={async () => {
                  const res = await a.on(ctx)
                  if (res) {
                    setError(res)
                    ctx.shakeModal()
                  }
                }}
              >
                {a.text}
              </Button>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export const PageBox: React.FC<{
  children: ReactNode
  style?: CSSProperties
}> = ({ style, children }) => {
  return (
    <div
      style={{
        minWidth: '100%',
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '30rem',
          width: '100%',
          margin: '3%',
          marginTop: '5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}
type ProfileTableProps = {
  children: ReactNode[]
  style?: CSSProperties
}

export const ProfileTable = ({ children, style }: ProfileTableProps) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: '1rem',
        width: '100%',
        ...style,
      }}
    >
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            whiteSpace: i % 2 === 0 ? 'normal' : 'break-spaces',
            wordBreak: i % 2 === 0 ? undefined : 'break-word',
            padding: '0.3rem 1rem 0.3rem 0',
            borderRight: i % 2 === 0 ? '1px solid #000' : undefined,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export const FadeDiv = ({
  isExist,
  children,
  ...rest
}: HTMLMotionProps<'div'> & {
  isExist: boolean
}) => {
  return (
    <AnimatePresence>
      {isExist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          {...rest}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type ButtonBoxLiteProps = {
  children: ReactNode
  width?: number
  height?: number
  style?: React.CSSProperties
  childStyle?: React.CSSProperties
  onClick?: () => void
}

export function ButtonBoxLite({ children, style, onClick, childStyle }: ButtonBoxLiteProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        ...style,
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => {
        setIsPressed(false)
        if (onClick) onClick()
      }}
      onMouseLeave={() => {
        setIsPressed(false)
        setHovered(false)
      }}
      onMouseEnter={() => setHovered(true)}
    >
      <div
        style={{
          transform: isPressed ? 'scale(1)' : hovered ? 'scale(1.2)' : 'scale(1.1)',
          transition: 'transform 0.3s ease',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...childStyle,
        }}
      >
        {children}
      </div>
    </div>
  )
}
