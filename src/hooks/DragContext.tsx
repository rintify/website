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
  defaultDropAnimation,
  ClientRect,
  Over,
} from '@dnd-kit/core'
import { CSSProperties } from 'styled-components'
import { useSpring, animated, to } from '@react-spring/web'
import { ulid } from 'ulid'
import { createPortal } from 'react-dom'
import { CollisionDetection, Rect } from '@dnd-kit/core/dist/utilities'

type DropHandler = (data: any) => void
type DataHandler = () => Promise<any> | any
type DragHandler = () => void
type OverHandler = (data: any) => void

interface DragContextValue {
  register: (id: string, onDrop: DropHandler, getData: DataHandler, onDrag: DragHandler, onOver: OverHandler) => void
  unregister: (id: string) => void
  isDragging: boolean
}

const DragContext = createContext<DragContextValue>({
  register: () => {},
  unregister: () => {},
  isDragging: false,
})

export const DragProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [handlers, setHandlers] = useState<
    Record<string, { onDrop: DropHandler; getData: DataHandler; onDrag: DragHandler; onOver: OverHandler }>
  >({})
  const sensors = useSensors(useSensor(PointerSensor,{
    activationConstraint: {
      delay: 500,
      tolerance: 5
    }
  }), useSensor(TouchSensor,{
    activationConstraint: {
      delay: 500,
      tolerance: 5
    }
  }))
  const [isDragging, setDragging] = useState(false)

  const register = useCallback<DragContextValue['register']>(
    (id, onDrop, getData, onDrag, onOver) => setHandlers(h => ({ ...h, [id]: { onDrop, getData, onDrag, onOver } })),
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

  const handleOver = async (activeId: string, overId?: string) => {
    const overHandler = overId ? handlers[overId] : undefined
    const activeHandler = handlers[activeId]
    overHandler?.onOver(await activeHandler?.getData())
    activeHandler?.onOver(await overHandler?.getData())
  }

  return (
    <DndContext
      autoScroll={false}
      sensors={sensors}
      onDragStart={({ active }) => {
        setDragging(true)
        const content = handlers[active.id]?.onDrag()
      }}
      onDragEnd={({ active, over }) => {
        handleDrop(active.id as string, over?.id as string | undefined)
        setDragging(false)
      }}
      onDragCancel={() => {
        setDragging(false)
      }}
      onDragOver={({ active, over }) => {
        handleOver(active.id as string, over?.id as string | undefined)
      }}
    >
      <DragContext.Provider value={{ register, unregister, isDragging }}>{children}</DragContext.Provider>
    </DndContext>
  )
}

export const useDragContext = () => useContext(DragContext)

type Props = {
  onDrop?: DropHandler
  getData?: DataHandler
  onOver?: OverHandler
  onDrag?: DragHandler
  onClick?: () => void
  children: React.ReactNode
  style?: CSSProperties | ((isOver: boolean) => CSSProperties)
  fullDrop?: boolean
  noborder?: boolean
  scaleRatio?: number
}

export function DropDiv({ noborder, fullDrop, style, onDrop, getData, children }: Props) {
  const id = useRef(ulid()).current
  const { isOver, setNodeRef } = useDroppable({ id })
  const { register, unregister, isDragging: isDraggings } = useDragContext()
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
    register(
      id,
      onDrop ?? function (data) {},
      getData ?? async function () {},
      () => undefined,
      () => {}
    )
    return () => {
      unregister(id)
    }
  }, [id, onDrop, getData, register, unregister])

  const spStyle = useSpring({
    transform: isOver || isDragging ? 'scale(1.1)' : 'scale(1)',
    config: { tension: 300, friction: 10 },
  })

  if (typeof style === 'function') style = style(isOver)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        ...style,
      }}
    >
      <animated.div
        ref={setNodeRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: !noborder ? '1px dashed #000' : undefined,
          zIndex: isDragging || isDraggings ? 1000 : 0,
          ...spStyle,
        }}
        onDragEnter={!fullDrop ? handleDragEnter : undefined}
        onDragOver={!fullDrop ? handleDragOver : undefined}
        onDragLeave={!fullDrop ? handleDragLeave : undefined}
        onDrop={!fullDrop ? handleDrop : undefined}
      ></animated.div>
      {children}
      {fullDrop && document?.body &&
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

export function DragDiv({ onClick,onDrag, onDrop, getData, onOver, children, style, scaleRatio = 1 }: Props) {
  const id = useRef(ulid()).current
  const renderRef = useRef<ReactNode>(undefined)

  const { attributes, listeners, setNodeRef, active, transform, isDragging } = useDraggable({ id })
  const { register, unregister } = useDragContext()
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const [over, setover] = useState(false)
  const [rect, setrect] = useState<ClientRect | undefined>(undefined)

  if (typeof style === 'function') style = style(over)

  useEffect(() => {
    if (active?.id === id && active?.rect.current.initial) setrect(active.rect.current.initial)
  }, [active, active?.rect.current, active?.rect.current.initial])

  const { scale } = useSpring({
    scale: pressed ? 0.9 : hovered ? 1.1 : 1,
    config: { tension: 300, friction: 10 },
  })

  const { x, y } = useSpring({
    x: transform?.x ?? 0,
    y: transform?.y ?? 0,
    shaddow: transform || isDragging ? 0.3 : 0,
    config: { duration: !transform ? 200 : 0 },
  })

  useEffect(() => {
    if (isDragging) {
      setover(true)
    } else {
      const t = window.setTimeout(() => {
        setover(false)
        setHovered(false)
        setPressed(false)
        setrect(undefined)
      }, 250)
      return () => {
        if (isDragging) clearTimeout(t)
      }
    }
  }, [isDragging])

  const { shaddow } = useSpring({
    shaddow: over ? 0.2 : 0,
    config: { duration: 100 },
  })

  renderRef.current = (
    <animated.div
      ref={setNodeRef}
      style={{
        transform: to([scale, x, y], (s, x, y) => `translate3d(${x}px, ${y}px, 0) scale(${1 + scaleRatio * (s - 1)})`),
        cursor: isDragging ? 'grabbing' : 'pointer',
        backgroundColor: over ? 'white' : 'transparent',
        boxShadow: to([shaddow], shaddow => `-1rem 2rem 30px rgba(0,0,0,${shaddow})`),
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
      onClick={onClick}
    >
      {children}
    </animated.div>
  )

  useEffect(() => {
    register(
      id,
      onDrop ?? function (data) {},
      getData ?? async function () {},
      onDrag ?? function () {},
      onOver ?? function () {}
    )
    return () => {
      unregister(id)
    }
  }, [id, onDrop, getData, register, unregister])

  return !over || !rect || !document?.body
    ? renderRef.current
    : createPortal(
        <div
          style={{
            position: 'absolute',
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
            zIndex: 100000000,
          }}
        >
          {renderRef.current}
        </div>,
        document.body
      )
}


