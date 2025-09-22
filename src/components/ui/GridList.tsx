'use client'

import React, { CSSProperties, ReactNode } from 'react'

type GridListProps<T> = {
  items: readonly T[]
  renderItem: (item: T, index: number) => ReactNode
  gridWidth: number | string 
  aspectRatio?: number 
  gap?: number | string
  style?: CSSProperties
}

export function GridList<T>({ items, renderItem, gridWidth, aspectRatio, gap = 0, style }: GridListProps<T>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${typeof gridWidth === 'number' ? `${gridWidth}px` : gridWidth}, 1fr))`,
        gap,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            aspectRatio,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
