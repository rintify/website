'use client'

import { HeaderMargine } from '@/components/Header'
import { ButtonBoxLite, ModalBox } from '@/components/ui/Box'
import { FloatingButton } from '@/components/ui/Button'
import { LoadingCover } from '@/components/ui/LoadingBar'
import TextField from '@/components/ui/Textarea'
import ButtonDiv from '@/components/ui/TextButton'
import { useModal } from '@/hooks/ModalContext'
import { AddIcon, EditIcon } from '@/icons'
import { createGroup, uploadGroupIcon, useGroups } from '@/lib/api/group'
import { fetchFile } from '@/lib/api/user'
import { createRange } from '@/lib/util'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const { groups, groupsLoading, mutateGroups } = useGroups()
  const { pushModal } = useModal()
  const router = useRouter()

  function CreateGroupModal() {
    const [groupName, setGroupName] = useState('')

    return (
      <ModalBox
        title={'新規グループを作成'}
        actions={async a => {
          const res = await createGroup(groupName)
          if (res.ok) {
            const icon = await fetchFile("/default_icon.png")
            uploadGroupIcon(res.group?.id, icon)
            a.popModal('group')
            mutateGroups()
            return
          }
          return res.error
        }}
      >
        グループ名
        <TextField single value={groupName} onChange={e => setGroupName(e)} />
      </ModalBox>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <HeaderMargine />

      <div
        style={{
          padding: '0rem 1rem',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
            gap: '1rem',
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
            padding: '1rem 0',
          }}
        >
          {groups?.map(group => (
            <div
              key={group.id}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid',
                position: 'relative',
                minHeight: '200px',
                transition: 'transform 0.4s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'scale(0.9)'
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onClick={() => router.push(`/groups/${group.id}`)}
            >
              <div
                style={{
                  width: '100%',
                  height: '120px',
                  backgroundImage: `url(/api/groups/${group.id}/icon)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              />
              <div
                style={{
                  padding: '1rem',
                  position: 'relative',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: '0',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LoadingCover list={[{ progress: groupsLoading !== 'loading', message: 'グループ読込中' }]} />

      <FloatingButton
        onClick={async () => {
          pushModal('group', () => <CreateGroupModal />)
        }}
      >
        <AddIcon stroke={'#fff'} />
      </FloatingButton>
    </>
  )
}
