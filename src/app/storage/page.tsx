'use client'

import { HeaderMargine } from '@/components/Header'
import Box, { Line, ModalBox, PageBox } from '@/components/ui/Box'
import { FloatingButton } from '@/components/ui/Button'
import { FileBox, FileFloatingButton } from '@/components/ui/FileBox'
import { LoadingCover } from '@/components/ui/LoadingBar'
import ButtonDiv from '@/components/ui/TextButton'
import { DragDiv, DropDiv } from '@/hooks/DragContext'
import { useModal } from '@/hooks/ModalContext'
import { FileIcon, UpIcon } from '@/icons'
import { uploadFile, useFileContent, useFiles, useSessionUser } from '@/lib/api'
import { useState, useEffect, Fragment } from 'react'

export default function FileViewer() {
  const { session, sessionLoading } = useSessionUser()
  const { files, filesLoading, mutateFiles } = useFiles(session?.id, 'private')
  const [dragFile, setDragFile] = useState<string | undefined>()
  const {pushModal} = useModal()

  const onChange = async (files: File[]) => {
    if (!session || !files) return
    for (const file of files) {
      await uploadFile(session.id, 'private', file)
    }
    mutateFiles()
  }

  return (
    <Box
      style={{
        width: '100%',
        gap: '2rem',
        alignItems: 'center'
      }}
    >
      <HeaderMargine />
      <DropDiv
        fullDrop
        noborder
        style={{
          maxWidth: '60rem',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(6rem, 6rem))',
          gap: '1rem',
        }}
        onDrop={data => {
          if (data instanceof DataTransfer) {
            onChange(Array.from(data.files))
          }
        }}
      >
        {files.map(file => (
          <div
            key={file}
            style={{
              width: '8rem',
              height: '8rem',
              borderRadius: '4px',
            }}
          >
            <DragDiv
              scaleRatio={0.5}
              style={isOver => {
                return {
                  width: '8rem',
                  height: '8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: file === dragFile ? '2px solid #0070f3' : isOver ? '1px solid #000' : undefined,
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s ease',
                }
              }}
              onClick={() => pushModal('a',() => <ModalBox title='aa' handleOK={async () => 'd'}>a</ModalBox>)}
              onDrop={data => {
                if (data !== 'delete') setDragFile(undefined)
              }}
              onOver={data => {
                setDragFile(data === 'delete' ? file : undefined)
              }}
            >
              <FileIcon style={{ width: '4rem', height: '4rem' }} />
              <div
                style={{
                  height: '3rem',
                  width: '6rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  wordWrap: 'unset',
                }}
              >
                {file.length < 15 ? file : file.substring(0, 8) + '...' + file.substring(file.length - 5)}
              </div>
            </DragDiv>
          </div>
        ))}
      </DropDiv>

      <FileFloatingButton fullDrop style={{ alignSelf: 'flex-start', marginLeft: '20%' }} button onChange={onChange} />
      <LoadingCover expose list={[{ progress: !filesLoading, message: 'ファイル一覧取得中' }]} />
    </Box>
  )
}
