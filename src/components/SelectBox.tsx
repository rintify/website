'use client'

import React, { useState, useEffect, useRef, ReactNode, ReactElement, CSSProperties } from 'react'
import TextField from './Textarea'
import { useModal } from '@/hooks/ModalContext'
import ButtonDiv from './TextButton'
import { ModalBox } from './Box'
import { title } from 'process'

interface SelectBoxProps<T> {
  data: { id: T; label: string }[]
  maxItems?: number
  defaultId?: T
  onSelect: (id: T) => void
  itemRenderer?: (id: T, label: string) => ReactNode
  style?: CSSProperties
  title?: string
}

function useSelectLogic<T extends string | number>(props: SelectBoxProps<T>) {
  const [query, setQuery] = useState(props.data.find(item => item.id === props.defaultId)?.label ?? '')
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => {
    const defaultItem = props.data.find(item => item.id === props.defaultId)
    if (defaultItem) {
      setQuery(defaultItem.label)
    } else if (props.defaultId === undefined) {
      setQuery('')
    }
  }, [props.defaultId, props.data])

  let noQueData = props.data.filter(item => item.label !== query)
  let filteredData = noQueData.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
  if (filteredData.length === 0) filteredData = noQueData
  filteredData = filteredData.slice(0, props.maxItems || 20)

  const handleSelectBase = (item: { id: T; label: string }) => {
    props.onSelect(item.id)
    setQuery(item.label)
  }

  const handleKeyDownBase = (e: React.KeyboardEvent, extraAction?: () => void) => {
    if (e.key === 'Enter' && !isComposing && filteredData.length > 0) {
      e.preventDefault()
      props.onSelect(filteredData[0].id)
      setQuery(filteredData[0].label)
      extraAction?.()
    }
  }

  return {
    query,
    setQuery,
    isComposing,
    setIsComposing,
    filteredData,
    handleSelect: handleSelectBase,
    handleKeyDown: handleKeyDownBase,
  }
}

export function SelectBox<T extends string | number>({
  data,
  maxItems = 20,
  defaultId,
  onSelect,
  itemRenderer = (_, label) => label,
  style,
}: SelectBoxProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownHeight, setDropdownHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const logic = useSelectLogic({ data, maxItems, defaultId, onSelect, itemRenderer })

  useEffect(() => {
    if (dropdownRef.current) {
      if (isOpen) {
        const height = dropdownRef.current.scrollHeight
        setDropdownHeight(Math.min(height, 200))
      } else {
        setDropdownHeight(0)
      }
    }
  }, [isOpen, logic.filteredData])

  const handleSelect = (item: { id: T; label: string }) => {
    logic.handleSelect(item)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', ...style }}>
      <div
        onKeyDown={e => logic.handleKeyDown(e, () => setIsOpen(false))}
        onCompositionStart={() => logic.setIsComposing(true)}
        onCompositionEnd={() => logic.setIsComposing(false)}
      >
        <TextField
          single
          value={logic.query}
          onChange={logic.setQuery}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 100)
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
          transition: 'height 0.13s ease-out, opacity 0.13s ease-out',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
          {logic.filteredData.map(item => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                minHeight: '1.2em',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {isOpen ? itemRenderer(item.id, item.label) : ''}
            </div>
          ))}
          {logic.filteredData.length === 0 && logic.query && (
            <div style={{ padding: '8px', color: '#999' }}>候補なし</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SelectText<T extends string | number>(props: SelectBoxProps<T> & { defaultText?: string; modalStyle?: CSSProperties }) {
  const { pushModal } = useModal()

  return (
    <ButtonDiv style={props.style} onClick={() => pushModal('select', () => <SelectModal {...props} style={props.modalStyle} />)}>
      {props.data.find(item => item.id === props.defaultId)?.label ?? props.defaultText ?? ''}
    </ButtonDiv>
  )
}

export function SelectModal<T extends string | number>(props: SelectBoxProps<T>): ReactElement {
  const { popModal } = useModal()

  const logic = useSelectLogic(props)

  const handleSelect = (item: { id: T; label: string }) => {
    logic.handleSelect(item)
    popModal('select')
  }

  return (
    <ModalBox
      style={props.style}
      title={props.title ?? '選択'}
      actions={[]}
    >
      <div
        style={{width: '100%'}} 
        onKeyDown={e => logic.handleKeyDown(e, () => popModal('select'))}
        onCompositionStart={() => logic.setIsComposing(true)}
        onCompositionEnd={() => logic.setIsComposing(false)}
      >
        <TextField single value={logic.query} onChange={logic.setQuery} />
      </div>
      <div style={{ overflowY: 'auto',  width: '100%', maxHeight: '80%', minHeight: '10rem' }}>
        {logic.filteredData.map(item => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            style={{
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              minHeight: '1.2em',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {props.itemRenderer ? props.itemRenderer(item.id, item.label) : item.label}
          </div>
        ))}
        {logic.filteredData.length === 0 && logic.query && (
          <div style={{ padding: '8px', color: '#999' }}>候補なし</div>
        )}
      </div>
    </ModalBox>
  )
}
