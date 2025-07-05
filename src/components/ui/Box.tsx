// app/components/Box.tsx
'use client'
import React, { CSSProperties, FC, HTMLAttributes, JSX, ReactNode } from 'react'
import styled from 'styled-components'
import Button from './Button'

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
  font-size: 1rem;
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

export const ModalBox: React.FC<{
  children: ReactNode
  style?: CSSProperties
  error?: ReactNode
  title: ReactNode
  handleOK: () => void
}> = ({ handleOK, title, style, children, error }) => {
  return (
    <Box style={{ width: '20rem', ...style }}>
      <Large>{title}</Large>
      <Box style={{ color: 'red' }}>{error ?? ''}</Box>
      {children}
      <Box row style={{ width: '100%', marginTop: '1rem', justifyContent: 'flex-end' }}>
        <Button onClick={handleOK}>OK</Button>
      </Box>
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
        rowGap: '1rem',
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
            paddingRight: '1rem',
            borderRight: i % 2 === 0 ? '1px solid #000' : undefined
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}