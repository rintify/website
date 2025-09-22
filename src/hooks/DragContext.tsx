'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback, useMemo } from 'react'
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
import styled from 'styled-components'
import { useClient } from './util'

type DropHandler = (data: any, rect?: ClientRect) => void | boolean
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    })
  )
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

  const handleOver = async (activeId: string, overId?: string) => {
    const overHandler = overId ? handlers[overId] : undefined
    const activeHandler = handlers[activeId]
    overHandler?.onOver(await activeHandler?.getData())
    activeHandler?.onOver(await overHandler?.getData())
  }

  const contextValue = useMemo(() => ({ register, unregister, isDragging }), [register, unregister, isDragging])

  return (
    <DndContext
      autoScroll={false}
      sensors={sensors}
      onDragStart={({ active }) => {
        setDragging(true)
        const content = handlers[active.id]?.onDrag()
      }}
      onDragEnd={async ({ active, over }) => {
        const activeId = active.id as string,
          overId = over?.id as string | undefined
        const overHandler = overId ? handlers[overId] : undefined
        const activeHandler = handlers[activeId]
        overHandler?.onDrop(await activeHandler?.getData())
        activeHandler?.onDrop(await overHandler?.getData(), over?.rect)
        setDragging(false)
      }}
      onDragCancel={() => {
        setDragging(false)
      }}
      onDragOver={({ active, over }) => {
        handleOver(active.id as string, over?.id as string | undefined)
      }}
    >
      <DragContext.Provider value={contextValue}>{children}</DragContext.Provider>
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
  areaStyle?: CSSProperties
}

export function DropDiv({ noborder, fullDrop, style, onDrop, getData, children, areaStyle }: Props) {
  const id = useRef(ulid()).current
  const { isOver, setNodeRef } = useDroppable({ id })
  const { register, unregister, isDragging: isDraggings } = useDragContext()
  const [isDragging, setIsDragging] = useState(false)
  const { window, document } = useClient()

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
    if (!fullDrop || !window) return

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
  }, [fullDrop, onDrop, window])

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
          borderColor: 'black',
          borderStyle: !noborder ? 'dashed' : undefined,
          borderWidth: '1px',
          zIndex: isDragging || isDraggings ? 1000 : 0,
          ...spStyle,
          ...areaStyle,
        }}
        onDragEnter={!fullDrop ? handleDragEnter : undefined}
        onDragOver={!fullDrop ? handleDragOver : undefined}
        onDragLeave={!fullDrop ? handleDragLeave : undefined}
        onDrop={!fullDrop ? handleDrop : undefined}
      ></animated.div>
      {children}
      {fullDrop &&
        document &&
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

export function DragDiv({ onClick, onDrag, onDrop, getData, onOver, children, style, scaleRatio = 1 }: Props) {
  const id = useRef(ulid()).current
  const renderRef = useRef<ReactNode>(undefined)
  const { window, document } = useClient()

  const { attributes, listeners, setNodeRef, active, transform, isDragging } = useDraggable({ id })
  const { register, unregister } = useDragContext()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [over, setOver] = useState(false)
  const [rect, setRect] = useState<ClientRect | undefined>(undefined)
  const [target, setTarget] = useState<{ x: number; y: number; drop: boolean }>({ x: 0, y: 0, drop: false })

  if (typeof style === 'function') style = style(over)

  useEffect(() => {
    if (active?.id === id && active?.rect.current.initial) {
      setRect(active.rect.current.initial)
    }
  }, [active, !!active?.rect.current, !!active?.rect.current.initial])

  useEffect(() => {
    if (isDragging) {
      setOver(true)
    } else if (over) {
      const t = window?.setTimeout(() => {
        setOver(false)
        setHovered(false)
        setPressed(false)
        setRect(undefined)
      }, 510)
      return () => {
        clearTimeout(t)
      }
    }
  }, [isDragging])

  useEffect(() => {
    if (target.drop) return
    const t = window?.setTimeout(() => {
      setTarget({ x: 0, y: 0, drop: false })
    })
    return clearTimeout(t)
  }, [target])

  renderRef.current = (
    <div
      ref={setNodeRef}
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
      style={{
        ...style,
        position: 'relative',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'pointer',
        backgroundColor: over ? 'white' : 'transparent',
        transition:
          `opacity 500ms ease, transform ${transform ? '0ms' : '200ms'} ease, box-shadow 100ms ease-out` +
          (style?.transition ? ', ' + style.transition : ''),
        transform: (() => {
          const s = pressed ? 0.9 : hovered ? 1.1 : 1
          const scale = 1 + scaleRatio * (s - 1)
          return `translate3d(${transform?.x ?? target.x}px, ${transform?.y ?? target.y}px, 0) scale(${scale})`
        })(),
        boxShadow: over ? '-1rem 2rem 30px rgba(0, 0, 0, 0.2)' : '-1rem 2rem 30px rgba(0, 0, 0, 0)',
      }}
    >
      {children}
    </div>
  )

  useEffect(() => {
    register(
      id,
      (data, _rect) => {
        if (rect && _rect && onDrop?.(data)) {
          const cx = (_rect.right + _rect.left) * 0.5,
            cy = (_rect.bottom + _rect.top) * 0.5
          const ax = (rect.right + rect.left) * 0.5,
            ay = (rect.bottom + rect.top) * 0.5
          setTarget({ x: cx - ax, y: cy - ay, drop: true })
        } else {
          setTarget({ x: 0, y: 0, drop: false })
        }
      },
      getData ?? (async () => {}),
      onDrag ?? (() => {}),
      onOver ?? (() => {})
    )
    return () => unregister(id)
  }, [id, onDrop, getData, register, unregister])

  return !over || !rect || !document || !window
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
