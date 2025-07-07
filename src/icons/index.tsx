import React, { CSSProperties } from 'react'

import EditSvg from './edit.svg'
import ScaleSvg from './scale.svg'
import UserSvg from './user.svg'
import FileSvg from './file.svg'
import CrossSvg from './cross.svg'
import ButtonDiv from '@/components/ui/TextButton'

export const EditIcon = (p: { style?: CSSProperties; onClick?: () => void }) =>
  p.onClick ? (
    <ButtonDiv onClick={p.onClick} style={{ userSelect: 'none' }}>
      <EditSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ ...p.style }} />
    </ButtonDiv>
  ) : (
    <EditSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ userSelect: 'none', ...p.style }} />
  )

export const ScaleIcon = (p: { style?: CSSProperties; onClick?: () => void }) =>
  p.onClick ? (
    <ButtonDiv onClick={p.onClick} style={{ userSelect: 'none' }}>
      <ScaleSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ ...p.style }} />
    </ButtonDiv>
  ) : (
    <ScaleSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ userSelect: 'none', ...p.style }} />
  )

export const UserIcon = (p: { style?: CSSProperties; onClick?: () => void }) =>
  p.onClick ? (
    <ButtonDiv onClick={p.onClick} style={{ userSelect: 'none' }}>
      <UserSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ ...p.style }} />
    </ButtonDiv>
  ) : (
    <UserSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ userSelect: 'none', ...p.style }} />
  )

export const FileIcon = (p: { style?: CSSProperties; onClick?: () => void }) =>
  p.onClick ? (
    <ButtonDiv onClick={p.onClick} style={{ userSelect: 'none' }}>
      <FileSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ ...p.style }} />
    </ButtonDiv>
  ) : (
    <FileSvg width='1.5rem' stroke='#000' strokeWidth='2rem' style={{ userSelect: 'none', ...p.style }} />
  )

export const CrossIcon = (p: { style?: CSSProperties; stroke?: string; strokeWidth?: number, onClick?: () => void }) =>
  p.onClick ? (
    <ButtonDiv onClick={p.onClick} style={{ userSelect: 'none' , ...p.style, display: 'flex', alignItems: 'center'}}>
      <CrossSvg width='1.5rem' stroke={p.stroke??'#000'} strokeWidth={`${(p.strokeWidth??1)*2}rem`}  style={{width: '100%', height: '100%'}}/>
    </ButtonDiv>
  ) : (
    <CrossSvg width='1.5rem' stroke={p.stroke??'#000'} strokeWidth={`${(p.strokeWidth??1)*2}rem`} style={{ userSelect: 'none', ...p.style }} />
  )
