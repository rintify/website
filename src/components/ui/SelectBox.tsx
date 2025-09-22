'use client'

import React, { useState, useEffect, useRef } from 'react'
import TextField from './Textarea'

interface SelectBoxProps<T> {
  data: { id: T; label: string }[]
  maxItems?: number
  defaultId?: T
  onSelect: (id: T) => void
}

export function SelectBox<T extends string | number>({ data, maxItems = 20, defaultId, onSelect }: SelectBoxProps<T>) {
  const [query, setQuery] = useState(data.find(item => item.id === defaultId)?.label ?? '')
  const [isComposing, setIsComposing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownHeight, setDropdownHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const defaultItem = data.find(item => item.id === defaultId)
    if (defaultItem) {
      setQuery(defaultItem.label)
    } else if (defaultId === undefined) {
      setQuery('')
    }
  }, [defaultId, data])

  let noQueData = data.filter(item => item.label !== query)
  let filteredData = noQueData.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
  if (filteredData.length === 0) filteredData = noQueData
  filteredData = filteredData.slice(0, maxItems)

  useEffect(() => {
    if (dropdownRef.current) {
      if (isOpen) {
        const height = dropdownRef.current.scrollHeight
        setDropdownHeight(Math.min(height, 200))
      } else {
        setDropdownHeight(0)
      }
    }
  }, [isOpen, filteredData])

  const handleSelect = (item: { id: T; label: string }) => {
    onSelect(item.id)
    setQuery(item.label)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div
        onKeyDown={e => {
          if (e.key === 'Enter' && !isComposing && filteredData.length > 0) {
            e.preventDefault()
            onSelect(filteredData[0].id)
            setQuery(filteredData[0].label)
            setIsOpen(false)
          }
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      >
        <TextField
          single
          value={query}
          onChange={value => setQuery(value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 50)
          }}
        />
      </div>
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          height: `${dropdownHeight}px`,
          overflow: 'hidden',
          backgroundColor: '#fff',
          zIndex: 1000,
          boxShadow: isOpen ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'height 0.1s ease-out, opacity 0.3s ease-out',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
          {filteredData.map(item => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {item.label}
            </div>
          ))}
          {filteredData.length === 0 && query && <div style={{ padding: '8px', color: '#999' }}>候補なし</div>}
        </div>
      </div>
    </div>
  )
}
