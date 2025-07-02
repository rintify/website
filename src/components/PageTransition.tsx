// components/layout-transition.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useSelectedLayoutSegment, usePathname } from 'next/navigation'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useContext, useEffect, useRef } from 'react'

/** 前回の値を保持するフック */
function usePreviousValue<T>(value: T): T | undefined {
  const prev = useRef<T | undefined>(undefined)
  useEffect(() => {
    prev.current = value
    return () => {
      prev.current = undefined
    }
  })
  return prev.current
}

/** コンテキストを“凍結”して急な更新を防ぐ */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext)
  const prevContext = usePreviousValue(context) || null
  const segment = useSelectedLayoutSegment()
  const prevSegment = usePreviousValue(segment)

  const changed = segment !== prevSegment && segment !== undefined && prevSegment !== undefined

  return <LayoutRouterContext.Provider value={changed ? prevContext : context}>{children}</LayoutRouterContext.Provider>
}

/** ページ遷移用コンポーネント */
interface LayoutTransitionProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
export function LayoutTransition({ children, style }: LayoutTransitionProps) {
  const segment = useSelectedLayoutSegment()

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
    >
      <AnimatePresence mode='sync' initial={false}>
        <motion.div
          key={segment}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            ...style,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1}}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
