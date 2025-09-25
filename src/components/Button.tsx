'use client'
import React, { ReactNode } from 'react'
import { useSpring, animated } from '@react-spring/web'
import ButtonDiv from './TextButton'

type ButtonProps = {
  children?: ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

export function FloatingButton({ children, onClick, style = {} }: ButtonProps) {
  return (
    <ButtonDiv
      onClick={onClick}
      style={{
        position: 'fixed',
        borderRadius: '50%',
        backgroundColor: 'black',
        bottom: '2rem',
        right: '2rem',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '4rem',
        height: '4rem',
        ...style
      }}
    >
      {children}
    </ButtonDiv>
  )
}

export default function Button({ children, onClick, style = {} }: ButtonProps) {
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)

  const spStyle = useSpring({
    transform: pressed ? 'scale(0.9)' : hovered ? 'scale(1.1)' : 'scale(1)',
    config: { tension: 300, friction: 10 },
  })

  return (
    <animated.div
      style={{
        padding: '0.5rem 1rem',
        lineHeight: 1.2,
        minWidth: '3rem',
        width: 'fit-content',
        border: '1px solid #222',
        backgroundColor: '#222',
        color: '#fff',
        cursor: 'pointer',
        display: 'inline-flex',
        userSelect: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        ...spStyle,
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
    >
      {children}
    </animated.div>
  )
}
