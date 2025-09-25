'use client'

import { HeaderMargine } from '@/app/Header'
import GroupGrid from '@/components/GroupGrid'
import { ButtonBoxLite, ModalBox } from '@/components/Box'
import { FloatingButton } from '@/components/Button'
import { LoadingCover } from '@/components/LoadingBar'
import TextField from '@/components/Textarea'
import ButtonDiv from '@/components/TextButton'
import { useModal } from '@/hooks/ModalContext'
import { AddIcon, EditIcon } from '@/icons'
import { createGroup, uploadGroupIcon, useGroups } from '@/lib/api/group'
import { fetchFile } from '@/lib/api/user'
import { createRange } from '@/lib/util'
import { useState } from 'react'
import Textarea from '@/components/Textarea'

export default function Page() {
  const { groups, groupsLoading, mutateGroups } = useGroups()
  const { pushModal } = useModal()

  function CreateGroupModal() {
    const [groupName, setGroupName] = useState('')

    return (
      <ModalBox
        title={'新規グループを作成'}
        actions={async a => {
          const res = await createGroup(groupName)
          if (res.ok) {
            const icon = await fetchFile('/default_icon.png')
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
      <HeaderMargine />


      <div
        style={{
          padding: '0rem 1rem',
          position: 'relative',
        }}
      >
        <GroupGrid groups={groups} />
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
