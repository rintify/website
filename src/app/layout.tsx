// app/layout.tsx
import Providers from "./providers";

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
          {children}
        </Providers>
      </body>
    </html>
  );
}
