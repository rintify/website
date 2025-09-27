import { Group } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeDiv } from './Box'

interface GroupGridProps {
  groups?: Group[]
}

interface GroupItemProps {
  group: Group
}

function GroupItem({ group }: GroupItemProps) {
  const router = useRouter()

  return (
    <motion.div
      key={group.id}
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid',
        position: 'relative',
        minHeight: '200px',
      }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
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
    </motion.div>
  )
}

export default function GroupGrid({ groups }: GroupGridProps) {
  return (
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
      <AnimatePresence mode="popLayout">
        {groups?.map(group => (
          <GroupItem key={group.id} group={group} />
        ))}
      </AnimatePresence>
    </div>
  )
}