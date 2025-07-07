import { UserIcon as UI } from '@/icons'
import { CSSProperties, RefObject, useEffect, useRef } from 'react'
import { ulid } from 'ulid';

export function UserIcon({userId, style }: { userId: string | undefined; style?: CSSProperties }) {

  return (
    <div
      style={{
        position: 'relative', 
        width: '2rem',
        height: '2rem',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px solid #000',
        margin: '0.5rem',
        ...style,
      }}
    >
      <UI
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          zIndex: 1
        }}
      />
      {userId && <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: userId ? `url(/api/files/${userId}/icons/icon.png)` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 2
        }}
      />}
    </div>
  )
}
