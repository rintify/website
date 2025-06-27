// app/layout.tsx
import Header from "@/components/Header";
import Providers from "./providers";
import { ModalProvider } from "@/hooks/ModalContext";

export const metadata = {
  title: 'Hello World',
  description: 'Minimal Next.js 15 + TypeScript demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <ModalProvider>
            <Header/>
                    {children}
          </ModalProvider>
        </Providers>
      </body>
    </html>
  );
}
