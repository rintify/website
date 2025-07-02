import { CSSProperties, ReactNode } from 'react'

export const PageBox: React.FC<{
  children: ReactNode
  style?: CSSProperties
}> = ({ style, children }) => {
  return (
    <div
      style={{
        minWidth: '100%',
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '40rem',
          width: '100%',
          margin: '3%',
          marginTop: '5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}
