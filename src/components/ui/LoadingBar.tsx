'use client'
import { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'


const LoadingBar: React.FC<{progress: number | boolean}> = ({ progress }) => {
  const [internalProgress, setInternalProgress] = useState(0)
  const rafRef = useRef<number>(0)

  if (progress === true) progress = 1

  useEffect(() => {
    const progressNumber = typeof progress === 'number' ? progress : progress ? 1 : 0
    setInternalProgress(progressNumber)
  }, [progress])

  useEffect(() => {
    if (typeof progress === 'boolean') {
      let lastTime = performance.now()
      const step = (now: number) => {
        const delta = (now - lastTime) / 1000
        lastTime = now
        setInternalProgress(p => Math.min(p + 0.2 * delta, 0.9))
        if (internalProgress < 0.9) {
          rafRef.current = requestAnimationFrame(step)
        }
      }
      rafRef.current = requestAnimationFrame(step)

      return () => {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [progress])


  return (
    <div
      style={{
        maxWidth: '90%',
        width: '20rem',
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease',
        padding: '1px',
        border: '1px solid #000',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '2px',
          backgroundColor: '#000',
          transformOrigin: 'left center',
          transform: `scaleX(${internalProgress})`,
          transition: 'transform 0.3s ease',
        }}
      />
    </div>
  )
}

const wave = keyframes`
  0%, 30%   { transform: translateY(0); }    
  40%       { transform: translateY(-0.5rem); }  
  50%, 100% { transform: translateY(0); }     
`

const Char = styled.span<{ $delay: number }>`
  display: inline-block;
  animation: ${wave} 2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  `

export const LoadingCover: React.FC<{expose?: boolean, list: {progress: number | boolean , message?: string}[]}> = ({ list, expose }) => {
  if(list.length === 0) return
  const {progress, message} = list.reduce((a,b) => (a.progress === false ? '0.9' : a.progress) < (b.progress === false ? '0.9' : b.progress) ? a : b)
  const isLoaded = typeof progress === 'number' ? progress >= 1 : progress

  const [mounted, setMounted] = useState(!isLoaded)
  const [visible, setVisible] = useState(false)
  const showTimeoutRef = useRef<number>(0)

  const text = (message ?? '読込み中') + '..'
  const waveChars = Array.from(text).map((char, i) => (
    <Char key={i} $delay={i * 0.1}>
      {char}
    </Char>
  ))

  useEffect(() => {
    if (isLoaded) {
      setVisible(false)
      const t = window.setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(t)
    } else {
      setMounted(true)
      setVisible(false)
      clearTimeout(showTimeoutRef.current)
      showTimeoutRef.current = window.setTimeout(() => {
        setVisible(true)
      }, 500)
    }
  }, [isLoaded])

  if (!mounted) return

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'white',
        opacity: isLoaded || expose && !visible  ? 0 : 1,
        transition: 'opacity 0.3s ease',
        width: '100%',
        height: '100%',
        zIndex: '10000',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.8rem',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div>{waveChars}</div>
        <LoadingBar progress={progress} />
      </div>
    </div>
  )
}
