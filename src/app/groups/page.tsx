'use client'

import { HeaderMargine } from '@/components/Header'
import { ButtonBoxLite, ModalBox } from '@/components/ui/Box'
import { FloatingButton } from '@/components/ui/Button'
import { GridList } from '@/components/ui/GridList'
import { LoadingCover } from '@/components/ui/LoadingBar'
import TextField from '@/components/ui/Textarea'
import ButtonDiv from '@/components/ui/TextButton'
import { useModal } from '@/hooks/ModalContext'
import { AddIcon, EditIcon } from '@/icons'
import { createGroup, useGroups } from '@/lib/api/group'
import { createRange } from '@/lib/util'
import { color, progress } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'

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
      <HeaderMargine />
      <GridList
        style={{}}
        items={groups ?? []}
        renderItem={g => (
          <ButtonBoxLite
            style={{
              width: '100%',
              height: '100%',
            }}
            onClick={() => router.push(`/groups/${g.id}`)}
          >
            {g.name}
          </ButtonBoxLite>
        )}
        aspectRatio={3 / 2}
        gridWidth={'25%'}
      />
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
