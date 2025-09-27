'use client'

import { HeaderMargine } from '@/app/Header'
import GroupGrid from '@/components/GroupGrid'
import Box, { ButtonBoxLite, ModalBox } from '@/components/Box'
import { FloatingButton } from '@/components/Button'
import { LoadingCover } from '@/components/LoadingBar'
import TextField from '@/components/Textarea'
import ButtonDiv from '@/components/TextButton'
import SearchBar from '@/components/SearchBar'
import { useModal } from '@/hooks/ModalContext'
import { AddIcon, EditIcon, LoupeIcon } from '@/icons'
import { createGroup, uploadGroupIcon, useGroups } from '@/lib/api/group'
import { fetchFile } from '@/lib/api/user'
import { createRange } from '@/lib/util'
import { useState } from 'react'
import Textarea from '@/components/Textarea'

export default function Page() {
  const { pushModal } = useModal()
  const [searchQuery, setSearchQuery] = useState('')
  const { groups, groupsLoading, mutateGroups } = useGroups({ query: searchQuery })

  function CreateGroupModal() {
    const [groupName, setGroupName] = useState('')

    return (
      <ModalBox
        title={'新規グループを作成'}
        actions={async a => {
          const res = await createGroup(groupName)
          if (res.ok) {
            const randomIcon = Math.floor(Math.random() * 10)
            const icon = await fetchFile(`/default_icons/${randomIcon}.png`)
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
        }}
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="グループを検索..." />
        <GroupGrid groups={groups} />
      </div>

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
