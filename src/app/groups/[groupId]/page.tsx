'use client'

import { use, useEffect, useState } from 'react'
import { updateGroup, useGroup, uploadGroupIcon } from '@/lib/api/group'
import { useModal } from '@/hooks/ModalContext'
import { ModalBox, PageBox, ProfileTable } from '@/components/ui/Box'
import Box, { Large, Small } from '@/components/ui/Box'
import TextField from '@/components/ui/Textarea'
import { EditIcon } from '@/icons'
import { LoadingCover } from '@/components/ui/LoadingBar'
import { MarkdownBox } from '@/components/ui/Markdown'
import { formatJapaneseDate } from '@/lib/util'
import { GroupIcon } from '@/components/Components'
import ButtonDiv from '@/components/ui/TextButton'
import { IconEditModal } from '@/components/ui/IconEditModal'
import { SelectBox } from '@/components/ui/SelectBox'
import { $Enums } from '@prisma/client'

export default function HomePage({ params }: NextParams) {
  const { pushModal, popModal } = useModal()
  const { groupId } = use(params)

  const { group, groupLoading, mutateGroup } = useGroup(groupId)

  const handleEditButton = () => {
    pushModal('editGroup', () => <EditModal />)
  }

  const handleIconButton = () => {
    pushModal('iconGroup', () => <IconModal />)
  }

  const EditModal = () => {
    const [nickName, setNickName] = useState('')
    const [comment, setComment] = useState('')
    const [visibility, setVisibility] = useState<$Enums.Permission>('PRIVATE')
    const [editability, setEditability] = useState<$Enums.Permission>('PRIVATE')

    useEffect(() => {
      if (!group) return
      setNickName(group.name)
      setComment(group.comment)
      setVisibility(group.visibility)
      setEditability(group.editability)
    }, [group])

    return (
      <ModalBox
        title='グループ編集'
        actions={async () => {
          if (!group) return 'グループが見つかりません'
          const res = await updateGroup(group.id, { name: nickName, comment, visibility, editability })
          if (res.ok) {
            mutateGroup()
            popModal('editGroup')
            return
          }
          return res.error
        }}
      >
        名前
        <TextField single value={nickName} onChange={e => setNickName(e)} />
        <Box row>
          <Box>
            閲覧権限
            <SelectBox
              defaultId={visibility}
              data={[
                { id: 'PUBLIC', label: 'すべての人' },
                { id: 'PRIVATE', label: 'メンバーのみ' },
              ]}
              onSelect={item => setVisibility(item)}
            />
          </Box>
          <Box>
            編集権限
            <SelectBox
              defaultId={editability}
              data={[
                { id: 'PUBLIC', label: 'すべての人' },
                { id: 'PRIVATE', label: 'メンバーのみ' },
              ]}
              onSelect={item => setEditability(item)}
            />
          </Box>
        </Box>
        コメント
        <TextField value={comment} onChange={e => setComment(e)} />
      </ModalBox>
    )
  }

  const IconModal = () => {
    return (
      <IconEditModal
        title='グループアイコン'
        uploadFunction={async file => {
          if (!group) return { ok: false, error: 'グループが見つかりません' }
          return await uploadGroupIcon(group.id, file)
        }}
        onSuccess={() => window.location.reload()}
        modalKey='iconGroup'
        popModal={popModal}
      />
    )
  }

  return (
    <PageBox>
      <Box row style={{ marginBottom: '2rem' }}>
        <ButtonDiv scaleRatio={0.5} onClick={handleIconButton}>
          <GroupIcon groupId={groupId} style={{ width: '6rem', height: '6rem ' }} />
        </ButtonDiv>
        <div>
          <Box row>
            <Large>{group?.name ?? ''}</Large>
            <EditIcon onClick={handleEditButton} style={{ backgroundColor: '', marginTop: '0.5rem' }} />
          </Box>
          <Small>ID: {group ? group.id : 'なし'}</Small>
        </div>
      </Box>

      <ProfileTable style={{ marginBottom: '2rem' }}>
        作成日
        {group ? formatJapaneseDate(group.createdAt) : 'なし'}
        閲覧
        {group?.visibility === 'PRIVATE' ? 'メンバーのみ' : group?.visibility === 'PUBLIC' ? 'すべての人' : ''}
        編集
        {group?.editability === 'PRIVATE' ? 'メンバーのみ' : group?.editability === 'PUBLIC' ? 'すべての人' : ''}
      </ProfileTable>

      <MarkdownBox content={group?.comment ?? ''} />

      <LoadingCover list={[{ progress: groupLoading !== 'loading' }]} />
    </PageBox>
  )
}
