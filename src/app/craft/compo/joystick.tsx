import { isDragging } from 'framer-motion'
import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Vector2 } from 'three'

type Props = {
  onFrame: (dir: Vector2 | undefined, deltaTime: number) => void
}

const Joystick: React.FC<Props> = ({ onFrame }) => {
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState(false)
  const directionRef = useRef<Vector2 | undefined>(undefined)
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

  function setNob(delta: Vector2 = new Vector2(0,0)) {
    if (!baseRef.current || !knobRef.current) return
    const rect = baseRef.current.getBoundingClientRect()
    const crect = knobRef.current.getBoundingClientRect()
    const radius = (rect.width - crect.width) / 2
    knobRef.current.style.transform = `translate(${(delta.x + radius).toFixed(1)}px, ${(delta.y + radius).toFixed(1)}px)`
    
  }

  useEffect(() => {
    setNob()
  }, [baseRef.current, knobRef.current])

  useEffect(() => {
    if (dragging) {
      prevTimeRef.current = performance.now()
      rafRef.current = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(rafRef.current)
      onFrame(undefined, 0)
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
      const radius = rect.width / 2
      const center = new Vector2(rect.left + radius, rect.top + radius)

      const raw = new Vector2(e.clientX, e.clientY).sub(center)
      const clampedLen = Math.min(raw.length(), radius)
      const dir = raw.clone().normalize() // 長さ1の方向ベクトル

      const disp = dir.clone().multiplyScalar(clampedLen)
      setNob(disp)
      directionRef.current = new Vector2(dir.x, -dir.y)
    },
    [dragging]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    baseRef.current?.releasePointerCapture(e.pointerId)
    setDragging(false)
    directionRef.current = undefined
    setNob()
  }, [])

  return (
    <div
      ref={baseRef}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        width: '10rem',
        height: '10rem',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #0000 0%, #0000 30%, #0002 100%)',
        zIndex: 1000,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={knobRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: '#0003',
          transition: `transform 100ms ease`,
          transform: `translate(50%,50%)`
        }}
      />
    </div>
  )
}

export default Joystick
