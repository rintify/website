import Button from '@/components/Button'
import ButtonDiv from '@/components/TextButton'
import { LoosIcon, ZoomIcon } from '@/icons'
import { AnimatePresence, HTMLMotionProps, isDragging, motion } from 'framer-motion'
import React, { useRef, useState, useCallback, useEffect, CSSProperties } from 'react'
import { Vector2 } from 'three'

type Props = {
  style?: CSSProperties
  onFrame: (dir: number, deltaTime: number) => void
}

export const Loupe: React.FC<Props> = ({ style, onFrame }) => {
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<HTMLDivElement>(null)
  const loosRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState(false)
  const directionRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const prevTimeRef = useRef<number>(0)

  const animate = useCallback(
    (time: number) => {
      if (!dragging) return
      const deltaTime = (time - prevTimeRef.current) / 1000 // 秒単位
      prevTimeRef.current = time
      onFrame(directionRef.current, deltaTime)
      rafRef.current = requestAnimationFrame(animate)
    },
    [dragging, onFrame]
  )

  function setNob(delta: number = 0) {
    if (!baseRef.current || !knobRef.current) return
    const rect = baseRef.current.getBoundingClientRect()
    const crect = knobRef.current.getBoundingClientRect()
    const offsetY = (rect.height - crect.height) / 2
    const offsetX = (rect.width - crect.width) / 2
    knobRef.current.style.transform = `translate(${offsetX.toFixed(1)}px, ${(delta + offsetY).toFixed(1)}px)`
    if (zoomRef.current) zoomRef.current.style.transform = delta > 0 ? `scale(1.2)` : `scale(1)`
    if (loosRef.current) loosRef.current.style.transform = delta < 0 ? `scale(1.2)` : `scale(1)`
  }

  useEffect(() => {
    setNob()
  }, [])

  useEffect(() => {
    if (dragging) {
      prevTimeRef.current = performance.now()
      rafRef.current = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(rafRef.current)
      onFrame(0, 0)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [dragging, animate, onFrame])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    baseRef.current?.setPointerCapture(e.pointerId)
    setDragging(true)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !baseRef.current || !knobRef.current) return

      const rect = baseRef.current.getBoundingClientRect()
      const half = rect.height / 2
      const center = rect.top + half
      const raw = e.clientY - center
      const clamped = Math.max(-half, Math.min(raw, half))
      setNob(clamped)
      directionRef.current = -clamped / half
    },
    [dragging]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    baseRef.current?.releasePointerCapture(e.pointerId)
    setDragging(false)
    directionRef.current = 0
    setNob()
  }, [])

  return (
    <div
      ref={baseRef}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 30,
        width: '2.5rem',
        height: '5rem',
        borderRadius: '1.2rem',
        backgroundColor: '#0001',
        zIndex: 1000,
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <ZoomIcon
        style={{
          left: '20%',
          top: '-2rem',
          position: 'absolute',
          transform: `translate(0,0)`,
          opacity: 0.3,
        }}
        strokeWidth={3}
      ></ZoomIcon>
      <div
        ref={knobRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          background: '#0003',
          transition: `transform 100ms ease`,
          transform: `translate(50%,50%)`,
        }}
      />
      <LoosIcon
        style={{
          left: '20%',
          bottom: '-2rem',
          position: 'absolute',
          transform: `translate(0,0)`,
          opacity: 0.3,
        }}
        strokeWidth={3}
      ></LoosIcon>
    </div>
  )
}


export function PopButton({ isExist, style, ...rest }: Parameters<typeof ButtonDiv>[0] & { isExist: boolean | undefined }) {
  return (
    <AnimatePresence>
      {isExist && (
        <motion.div
          initial={{ height: 0 , opacity: 0}}
          animate={{ height: '1.6em' , opacity: 1}}
          exit={{ height: 0 , opacity: 0}}
          transition={{ duration: 0.3 }}
        >
          <ButtonDiv
            style={{
              border: '1px solid #000',
              opacity: '0.5',
              padding: '0.2em 0.5em',
              lineHeight: 1.2,
              borderRadius: '0.8em',
              ...style,
            }}
            {...rest}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
