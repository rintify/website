// app/layout.tsx
import './globals.css'
import Header from '@/components/Header'
import Providers from './providers'
import { ModalProvider } from '@/hooks/ModalContext'
import { LayoutTransition } from '@/components/PageTransition'
import { ReactElement } from 'react'
import { DragProvider } from '@/hooks/DragContext'

export const metadata = {
  title: 'Hello World',
  description: 'Minimal Next.js 15 + TypeScript demo',
}

export default function RootLayout({ children }: { children: ReactElement }) {
  return (
    <html lang='ja'>
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          <DragProvider>
            <ModalProvider>
              <LayoutTransition>{children}</LayoutTransition>
              <Header />
            </ModalProvider>
          </DragProvider>
        </Providers>
      </body>
    </html>
  )
}
