'use client'
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  ReactElement,
  useEffect,
  RefAttributes,
} from 'react'
import { useTransition, animated, config, useSpring, useSpringRef } from '@react-spring/web'

type ModalItem = {
  key: string
  renderer: () => ReactElement
}

const ModalContext = createContext<{
  popModal: (tag: string) => void
  pushModal: (tag: string, renderer: () => ReactElement, multiple?: boolean) => void
  shakeModal: () => void
}>({
  popModal: () => {},
  pushModal: () => {},
  shakeModal: () => {},
})

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<ModalItem[]>([])
  const nextKey = useRef(0)

  const pushModal = (tag: string, renderer: () => ReactElement, multiple?: boolean) => {
    setModals(prev => {
      if (!multiple && prev.find(m => m.key.startsWith(tag))) return prev
      return [...prev, { key: (tag ?? '') + nextKey.current++, renderer }]
    })
  }

  useEffect(() => {
    document.body.style.overflow = modals.length > 0 ? 'hidden' : 'auto'
  }, [modals.length > 0])

  const popModal_byKey = (key: string) => {
    setModals(prev => {
      if (prev.length === 0) return prev
      if (prev[prev.length - 1].key !== key) return prev
      return prev.slice(0, -1)
    })
  }

  const popModal_byTag = (tag: string) => {
    setModals(prev => {
      if (prev.length === 0) return prev
      if (!prev[prev.length - 1].key.startsWith(tag)) return prev
      return prev.slice(0, -1)
    })
  }

  const transitions = useTransition(modals, {
    keys: item => item.key,
    from: { opacity: 0, transform: 'scale(0)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' },
    config: {
      tension: 300,
      friction: 20,
    },
  })

  const [shaking, setShaking] = useState(false)

  const shakeModal = () => {
    setShaking(prev => !prev)
  }

  return (
    <ModalContext.Provider value={{ pushModal, popModal: popModal_byTag, shakeModal }}>
      {children}

      {transitions((styles, item) => (
        <animated.div
          key={item.key}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            pointerEvents: modals.length > 0 ? 'auto' : 'none',
          }}
        >
          <animated.div
            onClick={() => popModal_byKey(item.key)}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              opacity: styles.opacity,
              pointerEvents: modals[modals.length - 1]?.key === item.key ? 'auto' : 'none',
            }}
          ></animated.div>

          <Shaking able={modals[modals.length - 1]?.key === item.key} value={shaking}>
            <animated.div
              style={{
                position: 'relative',
                background: '#fff',
                borderRadius: 4,
                padding: '1.5rem',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                transform: styles.transform,
                opacity: styles.opacity,
              }}
            >
              {item.renderer()}
            </animated.div>
          </Shaking>
        </animated.div>
      ))}
    </ModalContext.Provider>
  )
}

export function useModal() {
  return useContext(ModalContext)
}
export default ModalProvider

export function Blocker({ block, ...rest }: React.HTMLAttributes<HTMLDivElement> & { block?: boolean }) {
  const blockerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const blocker = blockerRef.current
    if (!blocker) return

    const events = ['click', 'dblclick', 'mousedown', 'mouseup', 'wheel', 'scroll', 'touchstart', 'touchmove']

    const handler: EventListenerOrEventListenerObject = e => {
      if (!block) return
      if (e.target !== blockerRef.current) return
      e.preventDefault()
      e.stopPropagation()
    }

    events.forEach(ev => {
      blocker.addEventListener(ev, handler, { capture: true, passive: false })
    })

    return () => {
      events.forEach(ev => {
        blocker.removeEventListener(ev, handler, { capture: true })
      })
    }
  }, [])

  return <div ref={blockerRef} style={{ position: 'absolute', inset: 0, backgroundColor: '#0002' }} {...rest}></div>
}


export const Shaking = ({ able, value, children }: {able: boolean, value: boolean, children: ReactNode }) => {

  const springRef = useSpringRef();
  const styles = useSpring({
    ref: springRef,
    from: { x: 0 },

    to: async (next) => {
      await next({
        x: 3,
        config: { duration: 50 },
      });
      await next({
        x: 0,
        config: { tension: 2000, friction: 10 },
      });
    },
  });

  const pre = useRef(value)

  useEffect(() => {
    if(able && pre.current != value) springRef.start();
    pre.current = value
  }, [value, springRef]);

  return <animated.div style={{
      transform: styles.x.to((x) => `translateX(${x}rem)`)
    }}>{children}</animated.div>;
}