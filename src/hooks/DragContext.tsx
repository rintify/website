'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  DraggableNode,
  useDraggable,
  TouchSensor,
} from '@dnd-kit/core'
import { CSSProperties } from 'styled-components'
import { useSpring, animated, to } from '@react-spring/web'
import { ulid } from 'ulid'
import { createPortal } from 'react-dom'

type DropHandler = (data: any) => void
type DataHandler = () => Promise<any> | any

interface DragContextValue {
  register: (id: string, onDrop: DropHandler, getData: DataHandler) => void
  unregister: (id: string) => void
  isDragging: boolean
}

const DragContext = createContext<DragContextValue>({
  register: () => {},
  unregister: () => {},
  isDragging: false,
})

export const DragProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [handlers, setHandlers] = useState<Record<string, { onDrop: DropHandler; getData: DataHandler }>>({})
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))
  const [isDragging, setDragging] = useState(false)

  const register = useCallback(
    (id: string, onDrop: DropHandler, getData: DataHandler) => setHandlers(h => ({ ...h, [id]: { onDrop, getData } })),
    []
  )

  const unregister = useCallback(
    (id: string) =>
      setHandlers(h => {
        const { [id]: _, ...rest } = h
        return rest
      }),
    []
  )

  const handleDrop = async (activeId: string, overId?: string) => {
    const overHandler = overId ? handlers[overId] : undefined
    const activeHandler = handlers[activeId]
    overHandler?.onDrop(await activeHandler?.getData())
    activeHandler?.onDrop(await overHandler?.getData())
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={() => setDragging(true)}
      onDragEnd={({ active, over }) => {
        handleDrop(active.id as string, over?.id as string | undefined)
        setDragging(false)
      }}
      onDragCancel={() => setDragging(false)}
    >
      <DragContext.Provider value={{ register, unregister, isDragging }}>{children}</DragContext.Provider>
    </DndContext>
  )
}

export const useDragContext = () => useContext(DragContext)

type Props = {
  onDrop?: DropHandler
  getData?: DataHandler
  children: React.ReactNode
  style?: CSSProperties
  fullDrop?: boolean
}

export function DropDiv({ fullDrop, style, onDrop, getData, children }: Props) {
  const id = useRef(ulid()).current
  const { isOver, setNodeRef } = useDroppable({ id })
  const { register, unregister, isDragging: isDraggings} = useDragContext()
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = async (e: React.DragEvent<HTMLDivElement> | DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer) onDrop?.(e.dataTransfer)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement> | DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement> | DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement> | DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  useEffect(() => {
    if (!fullDrop) return

    window.addEventListener('dragenter', handleDragEnter)

    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [fullDrop, onDrop])

  useEffect(() => {
    register(id, onDrop ?? function (data) {}, getData ?? async function () {})
    return () => {
      unregister(id)
    }
  }, [id, onDrop, getData, register, unregister])

  const spStyle = useSpring({
    transform: isOver || isDragging ? 'scale(1.1)' : 'scale(1)',
    config: { tension: 300, friction: 10 },
  })

  return (
    <div
      style={{
        position: 'relative',
        userSelect: 'none',
        minHeight: '5rem',
        minWidth: '8rem',
        ...style,
      }}
    >
      <animated.div
        ref={setNodeRef}
        style={{
          position: 'absolute',
          border: '1px dashed #000',
          width: '100%',
          height: '100%',
          ...spStyle,
        }}
        onDragEnter={fullDrop ? handleDragEnter : () => {}}
        onDragOver={fullDrop ? handleDragOver : () => {}}
        onDragLeave={fullDrop ? handleDragLeave : () => {}}
        onDrop={fullDrop ? handleDrop : () => {}}
      ></animated.div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -45%)',
          display: 'flex',
          justifyItems: 'flex-start',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: '100',
        }}
      >
        {children}
      </div>
      {fullDrop &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#fff8',
              zIndex: 10000000,
              pointerEvents: 'none',
              opacity: isDragging ? 1 : 0,
              transition: 'opacity ease 0.3s',
            }}
          />,
          document.body
        )}
    </div>
  )
}

export function DragDiv({ onDrop, getData, children, style }: Props) {
  const id = useRef(ulid()).current
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const { register, unregister } = useDragContext()
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)

  useEffect(() => {
    register(id, onDrop ?? function (data) {}, getData ?? async function () {})
    return () => {
      unregister(id)
    }
  }, [id, onDrop, getData, register, unregister])

  const { scale } = useSpring({
    scale: pressed ? 1 : hovered ? 1.1 : 1,
    config: { tension: 300, friction: 10 },
  })

  const { x, y } = useSpring({
    x: transform?.x ?? 0,
    y: transform?.y ?? 0,
    shaddow: transform || isDragging ? 0.3 : 0,
    config: { duration: !transform ? 200 : 0 },
  })

  const { shaddow } = useSpring({
    shaddow: hovered || transform || isDragging ? 0.3 : 0,
    config: { duration: 200 },
  })

  return (
    <animated.div
      ref={setNodeRef}
      style={{
        transform: to([x, y, scale], (x, y, s) => `translate3d(${x}px, ${y}px, 0) scale(${s})`),
        borderRadius: '5px',
        cursor: 'grab',
        boxShadow: to([shaddow], shaddow => `-1rem 1rem 20px rgba(0,0,0,${shaddow})`),
        backgroundColor: 'transparent',
        touchAction: 'none',
        ...style,
      }}
      {...listeners}
      {...attributes}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </animated.div>
  )
}
