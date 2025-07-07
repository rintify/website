'use client'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import Button from './Button'
import { createPortal } from 'react-dom'
import ButtonDiv from './TextButton'
import { hover } from 'framer-motion'
import dynamic from 'next/dynamic'
import { CrossIcon, FileIcon } from '@/icons'
import { DragDiv, DropDiv } from '@/hooks/DragContext'

type Props = {
  files?: File[] | File
  onChange: (files: File[]) => void
  style?: React.CSSProperties
  fullDrop?: boolean
}

export function FileBox({ fullDrop, files: f, onChange, style }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const files = Array.isArray(f) ? f : f ? [f] : []


  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (!e.target.files) return
    onChange([...files, ...Array.from(e.target.files)])
  }


  return (
    <div
      style={{
        ...style,
      }}
      onClick={() => {
        inputRef.current?.click()
      }}
    >
      <input type='file' ref={inputRef} style={{ display: 'none' }} onChange={handleChange} />
      <DropDiv fullDrop={fullDrop} onDrop={data => {
        if(data instanceof DataTransfer){
            onChange(Array.from(data.files))
        }
      }} getData={() => 'filebox'}>
        {files.length === 0 ? (
          <div style={{}}>ファイル追加</div>
        ) : (
          <DragDiv
            onDrop={data => {
              if (data !== 'filebox') {
                onChange(files.filter((_, i) => i !== 0))
              }
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              <FilePreview file={files[0]} />
            </div>
          </DragDiv>
        )}
      </DropDiv>
    </div>
  )
}

type FVProps = {
  file: File
}


export default function FilePreview({ file }: FVProps) {
  const [imageURL, setImageURL] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return () => {
      if (imageURL) URL.revokeObjectURL(imageURL)
    }
  }, [imageURL])

  useEffect(() => {
    const type = file.type

    if (type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setImageURL(url)
    }
  }, [file])

  return (
    <div>
      {file.type.startsWith('image/') && imageURL && (
        <img
          src={imageURL}
          alt='file preview'
          style={{
            width: '4rem',
            height: '4rem',
            objectFit: 'cover',
            borderRadius: 4,
          }}
        />
      )}

      {!file.type.startsWith('image/') && <FileIcon style={{ width: '4rem', height: '4rem' }} />}
    </div>
  )
}
