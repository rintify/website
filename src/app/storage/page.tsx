'use client'

import AuthModal from '@/components/AuthModal'
import { GroupIcon, UserIcon } from '@/components/Components'
import { HeaderMargine } from '@/components/Header'
import Box, { FadeDiv, Large, Medium, Line, ModalBox, PageBox, ProfileTable, Small } from '@/components/ui/Box'
import Button, { FloatingButton } from '@/components/ui/Button'
import { FileBox, FileFloatingButton } from '@/components/ui/FileBox'
import { LoadingBar, LoadingCover } from '@/components/ui/LoadingBar'
import ButtonDiv from '@/components/ui/TextButton'
import { DragDiv, DropDiv, useDragContext } from '@/hooks/DragContext'
import { useModal } from '@/hooks/ModalContext'
import { FileIcon, UpIcon } from '@/icons'
import { useSessionUser } from '@/lib/api/user'
import { useGroups, useGroupFileList, uploadGroupFile, deleteGroupFile } from '@/lib/api/group'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Fragment } from 'react'

export default function FileViewer() {
  const { session, sessionLoading } = useSessionUser()
  const { groups, groupsLoading } = useGroups()
  const firstGroup = groups?.[0]
  const { files, groupFileListLoading, mutateGroupFileList } = useGroupFileList(
    !groupsLoading && firstGroup ? firstGroup.id : undefined
  )
  const router = useRouter()

  const [dragFile, setDragFile] = useState<string | undefined>()
  const { pushModal, popModal } = useModal()
  const { isDragging } = useDragContext()
  const { push } = useRouter()

  const onChange = async (files: File[]) => {
    if (!session) {
      pushModal('auth', () => <AuthModal />)
      return
    }
    if (!firstGroup) {
      alert('所属するグループがありません')
      return
    }
    if (!files) return
    for (const file of files) {
      const res = await uploadGroupFile(firstGroup.id, file.name, file)
      if (!res.ok) alert(res.error)
    }
    mutateGroupFileList()
  }

  return (
    <Box
      style={{
        width: '100%',
        gap: '2rem',
        alignItems: 'center',
      }}
    >
      <HeaderMargine />
      <div style={{ alignSelf: 'flex-start', marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
        <ButtonDiv onClick={() => router.push(`/groups/${firstGroup?.id}`)}>
          <GroupIcon groupId={firstGroup?.id} style={{ width: '4rem', height: '4rem' }} />
        </ButtonDiv>
        <div>
          <span style={{ display: 'flex', alignItems: 'baseline' }}>
            <Medium>{firstGroup?.name ?? 'グループなし'}</Medium>のストレージ
          </span>
          <LoadingBar
            style={{ marginTop: '0.5rem', width: '15rem' }}
            progress={
              (Array.isArray(files) ? files.reduce((s: number, f: { size: number }) => s + f.size, 0) : 0) /
              (20 * 1024 * 1024)
            }
          />
        </div>
      </div>
      <DropDiv
        fullDrop
        noborder
        style={{
          maxWidth: '60rem',
          width: '95%',
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
        {!Array.isArray(files) || files.length === 0 ? (
          <Small style={{ whiteSpace: 'nowrap' }}>ファイルがありません</Small>
        ) : (
          files.map(file => (
            <div
              key={file.name}
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
                    transition: 'border-color 0.3s ease, border-width 0.3s ease',
                    borderColor: dragFile === file.name ? '#f00' : isOver ? '#000' : '#0000',
                    borderStyle: 'solid',
                    borderWidth: dragFile === file.name ? '2px' : '1px',
                    borderRadius: '4px',
                  }
                }}
                onClick={() =>
                  pushModal(file.name, () => (
                    <ModalBox
                      title='ファイル詳細'
                      actions={[
                        {
                          on: async ctx => {
                            ctx.popModal(file.name)
                            if (firstGroup) {
                              await deleteGroupFile(firstGroup.id, file.name)
                              mutateGroupFileList()
                            }
                          },
                          text: '削除',
                        },
                        {
                          on: async ctx => {
                            ctx.popModal(file.name)
                          },
                          text: 'OK',
                        },
                      ]}
                    >
                      <ProfileTable>
                        ファイル名
                        {file.name}
                        サイズ
                        {`${file.size} バイト`}
                        URL
                        <ButtonDiv
                          line
                          onClick={() => {
                            if (firstGroup) {
                              push(`/api/groups/${firstGroup.id}/files/${encodeURIComponent(file.name)}`)
                            }
                          }}
                        >
                          {encodeURIComponent(file.name).substring(0, 15)}...
                        </ButtonDiv>
                      </ProfileTable>
                    </ModalBox>
                  ))
                }
                onDrop={data => {
                  if (data === 'delete') {
                    if (firstGroup) {
                      deleteGroupFile(firstGroup.id, file.name).then(() => mutateGroupFileList())
                      return true
                    }
                  }
                  setDragFile(undefined)
                }}
                onOver={data => {
                  setDragFile(data === 'delete' ? file.name : undefined)
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
                  {file.name.length < 15
                    ? file.name
                    : file.name.substring(0, 8) + '...' + file.name.substring(file.name.length - 5)}
                </div>
              </DragDiv>
            </div>
          ))
        )}
      </DropDiv>

      <FileFloatingButton fullDrop style={{ alignSelf: 'flex-start', marginLeft: '20%' }} button onChange={onChange} />
      <FadeDiv isExist={isDragging}>
        <DropDiv
          style={{ width: '10rem', height: '10rem', bottom: '5rem', left: '5rem', position: 'fixed', color: 'red' }}
          areaStyle={{ backgroundColor: '#f003', borderColor: 'red' }}
          getData={() => 'delete'}
        >
          ファイルを削除
        </DropDiv>
      </FadeDiv>
      <LoadingCover expose list={[{ progress: groupFileListLoading !== 'loading', message: 'ファイル一覧取得中' }]} />
    </Box>
  )
}
