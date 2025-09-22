
'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/ui/Button'
import { delay, useSessionUser } from '@/lib/api/user'
import { updateGroup, useGroup } from '@/lib/api/group'
import { useModal } from '@/hooks/ModalContext'
import { HeaderMargine } from '@/components/Header'
import { Medium, ModalBox, PageBox, ProfileTable } from '@/components/ui/Box'
import Box, { Large, Small } from '@/components/ui/Box'
import TextField from '@/components/ui/Textarea'
import { EditIcon } from '@/icons'
import { LoadingCover } from '@/components/ui/LoadingBar'
import { MarkdownBox } from '@/components/ui/Markdown'
import { formatJapaneseDate } from '@/lib/util'
import { UserIcon } from '@/components/Components'
import ButtonDiv from '@/components/ui/TextButton'
import { FileBox } from '@/components/ui/FileBox'
import imageCompression from 'browser-image-compression'
import { useRouter } from 'next/navigation'

export default function HomePage({params}: NextParams) {
  const { pushModal, popModal } = useModal()
  const { groupId } = use(params);

  const { group, groupLoading, mutateGroup } = useGroup(groupId)

  const handleEditButton = () => {
    pushModal('editGroup', () => <EditModal />)
  }

  const EditModal = () => {
    const [nickName, setNickName] = useState('')
    const [comment, setComment] = useState('')

    useEffect(() => {
      if (!group) return
      ;(setNickName(group.name), setComment(group.comment))
    }, [group])

    return (
      <ModalBox title='グループ編集' actions={async () => {
        if (!group) return 'グループが見つかりません'
        const res = await updateGroup(group.id, { name: nickName, comment })
        if (res.ok) {
          mutateGroup()
          popModal('editGroup')
          return
        }
        return res.error
      }}>
        名前
        <TextField single value={nickName} onChange={e => setNickName(e)} />
        コメント
        <TextField value={comment} onChange={e => setComment(e)} />
      </ModalBox>
    )
  }

  return (
    <PageBox>
      <Box row style={{ marginBottom: '2rem' }}>
        <ButtonDiv scaleRatio={0.5}>
          <div style={{ backgroundColor: 'red', width: '6rem', height: '6rem ' }} />
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
      </ProfileTable>

      <MarkdownBox content={group?.comment ?? ''} />

      <LoadingCover list={[{ progress: groupLoading !== 'loading' }]} />
    </PageBox>
  )
}
