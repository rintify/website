import { Group } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface GroupGridProps {
  groups?: Group[]
}

export default function GroupGrid({ groups }: GroupGridProps) {
  const router = useRouter()

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
  )
}