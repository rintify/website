import { CSSProperties, ReactNode, useCallback, useEffect, useReducer, useRef, useState } from 'react'

export type ListBoxProps = {
  dataCount: number
  initialDataIndex: number
  renderer: (dataIndex: number) => ReactNode
  style?: CSSProperties
}

const range = (start: number, end: number): number[] => Array.from({ length: end - start }, (_, i) => start + i)

export function ListBox({ dataCount, initialDataIndex, renderer, style }: ListBoxProps) {
  const visual = useRef({
    items: range(initialDataIndex, Math.min(initialDataIndex + 20, dataCount)).map(e => {
      return { dataIndex: e, ref: null as HTMLDivElement | null }
    }),
    virginHeight: 500,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const requiring = useRef(false)
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const paddingTop = 1000
  const paddingBottom = 1000
  const leastLength = 10
  const touchStartY = useRef(0)
  const loadingPadding = 500

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollTop = paddingTop
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (containerRef.current) {
        update(e.deltaY)
      }
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (containerRef.current) {
        update(touchStartY.current - e.touches[0].clientY)
        touchStartY.current = e.touches[0].clientY
      }
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, {
      passive: false,
    })
    container.addEventListener('touchmove', onTouchMove, {
      passive: false,
    })

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const update = useCallback(
    (delta: number) => {
      const prev = visual.current
      const frame = containerRef.current?.getBoundingClientRect()
      const prevFirstItemRect = prev.items[0].ref?.getBoundingClientRect()
      const prevLastItemRect = prev.items[prev.items.length - 1].ref?.getBoundingClientRect()
      const prevFirstItem = prev.items[0]
      const prevLastItem = prev.items[prev.items.length - 1]
      const prevItemsRect = prev.items.map(e => e.ref?.getBoundingClientRect()).filter(e => !!e)

      if (
        !containerRef.current ||
        requiring.current ||
        !prevFirstItemRect ||
        !prevLastItemRect ||
        !frame ||
        prevItemsRect.length !== prev.items.length
      )
        return

      if (prevLastItem.dataIndex === dataCount - 1 && delta > 0 && prevLastItemRect.bottom - delta < frame.bottom) {
        delta = prevLastItemRect.bottom - frame.bottom
      }

      if (prevFirstItem.dataIndex === 0 && delta < 0 && prevFirstItemRect.top - delta > frame.top) {
        delta = prevFirstItemRect.top - frame.top
      }
      containerRef.current.scrollTop += delta

      const next = { ...prev, items: [...prev.items] }

      if (prevFirstItemRect.top > frame.top - loadingPadding) {
        const requiredCount = Math.min(
          prevFirstItem.dataIndex,
          Math.ceil((prevFirstItemRect.top - frame.top + loadingPadding) / prev.virginHeight)
        )
        next.items.unshift(
          ...range(prevFirstItem.dataIndex - requiredCount, prevFirstItem.dataIndex).map(e => {
            return { dataIndex: e, ref: null }
          })
        )
        requiring.current = true
      } else {
        const onFrameTopIndex = Math.min(
          prev.items.length - leastLength,
          prevItemsRect.findLastIndex(r => r.bottom < frame.top - loadingPadding)
        )
        if (onFrameTopIndex >= 0) {
          next.items.splice(0, onFrameTopIndex + 1)
          requiring.current = true
        }
      }

      if (prevLastItemRect.bottom < frame.bottom + loadingPadding) {
        const requiredCount = Math.min(
          dataCount - prevLastItem.dataIndex - 1,
          Math.ceil((frame.bottom - prevLastItemRect.bottom + loadingPadding) / prev.virginHeight)
        )
        next.items.push(
          ...range(prevLastItem.dataIndex + 1, prevLastItem.dataIndex + 1 + requiredCount).map(e => {
            return { dataIndex: e, ref: null }
          })
        )
        requiring.current = true
      } else {
        const idx = prevItemsRect.findIndex(r => r.top > frame.bottom + loadingPadding)
        const onFrameBottomIndex = Math.max(leastLength, idx === -1 ? Infinity : idx)
        if (onFrameBottomIndex >= 0 && onFrameBottomIndex < next.items.length) {
          next.items.splice(onFrameBottomIndex)
          requiring.current = true
        }
      }

      if (requiring.current) {
        next.virginHeight = Math.max(
          prev.virginHeight * 0.7 +
            (prevItemsRect.reduce((acc, curr) => acc + (curr.height ?? 0), 0) / prevItemsRect.length) * 0.3,
          10
        )
        visual.current = next
        forceUpdate()
      }
    },
    [dataCount]
  )

  requiring.current = false
  const nowVisulaItems = visual.current.items

  return (
    <div
      ref={containerRef}
      style={{
        overflow: 'hidden',
        height: '40rem',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          paddingTop,
          paddingBottom,
          backgroundColor: '#0001',
        }}
      >
        {nowVisulaItems.map((item, viewIndex) => (
          <div
            ref={e => {
              if (e) nowVisulaItems[viewIndex].ref = e
            }}
            key={item.dataIndex}
          >
            {renderer(item.dataIndex)}
          </div>
        ))}
      </div>
    </div>
  )
}
