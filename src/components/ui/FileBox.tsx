'use client'
import React, { FC, ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import Button, { FloatingButton } from './Button'
import { createPortal } from 'react-dom'
import ButtonDiv from './TextButton'
import { hover } from 'framer-motion'
import dynamic from 'next/dynamic'
import { CrossIcon, FileIcon, UpIcon } from '@/icons'
import { DragDiv, DropDiv } from '@/hooks/DragContext'

type Props = {
  files?: File[] | File
  onChange: (files: File[]) => void
  style?: React.CSSProperties
  fullDrop?: boolean
  button?: boolean
}

function createFileIx(
  render: FC<
    Props & {
      files: File[]
      inputRef: RefObject<HTMLInputElement | null>
      handleChange: React.ChangeEventHandler<HTMLInputElement>
    }
  >
) {
  return (p: Props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const files = Array.isArray(p.files) ? p.files : p.files ? [p.files] : []

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
      if (!e.target.files) return
      p.onChange([...files, ...Array.from(e.target.files)])
    }

    return render({ ...p, files, inputRef, handleChange })
  }
}

export const FileFloatingButton = createFileIx(({ inputRef, handleChange }) => {
  return (
    <FloatingButton
      onClick={() => {
        inputRef.current?.click()
      }}
    >
      <input type='file' ref={inputRef} style={{ display: 'none' }} onChange={handleChange} />
      <UpIcon stroke='#fff' />
    </FloatingButton>
  )
})

export const FileBox = createFileIx(({ button, fullDrop, files, onChange, style, handleChange, inputRef }) => {
  const B = button ? Button : ButtonDiv

  return (
    <div
      style={{
        height: '3rem',
        width: '10rem',
        ...style,
      }}
      onClick={() => {
        inputRef.current?.click()
      }}
    >
      <input type='file' ref={inputRef} style={{ display: 'none' }} onChange={handleChange} />
      <DropDiv
        fullDrop={fullDrop}
        onDrop={data => {
          if (data instanceof DataTransfer) {
            onChange(Array.from(data.files))
          }
        }}
        getData={() => 'filebox'}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
      >
        {files.length === 0 ? (
          <B>
            <UpIcon
              stroke={button ? '#fff' : '#000'}
              style={{ width: '1.2rem', marginRight: '0.2rem', alignSelf: 'end' }}
            />
            ファイル追加
          </B>
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
})

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
