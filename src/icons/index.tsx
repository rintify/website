import React, { CSSProperties } from 'react'

import EditSvg from './edit.svg'
import ScaleSvg from './scale.svg'
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
