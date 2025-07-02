// app/page.tsx
"use client";

import { signOut } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import Button from "@/components/ui/Button";
import { useUser } from '@/hooks/useUser';
import { useModal } from '@/hooks/ModalContext';
import { HeaderMargine } from '@/components/Header';
import { PageBox } from "@/components/ui/PageBox";


export default function HomePage() {
  const user = useUser();
  const {pushModal} = useModal()

  const handleButtonClick = () => {
    pushModal(() => <AuthModal/>)
    return
    if (!user) {
      signOut({ redirect: false }).then(() => window.location.reload());
    } else {
      
    }
  };

  return (
            <PageBox>
                <h1>{user?.nickName ?? 'ゲスト'}</h1>
                {`コンテンツへとスキップする
チャット履歴

あなた:
https://maxschmitt.me/posts/nextjs-page-transitions-framer-motion?utm_source=chatgpt.com これと同じ方法を最新NExtのApp routerでもできる方法を検索して調べて
ChatGPT:

思考時間: 7 秒
以下の手順で、Max Schmitt さんの記事と同様のページ遷移アニメーションを、最新の Next.js App Router（Next.js 14.x）＋Framer Motion で実現できます。

1. Framer Motion のインストール
# bun を使う場合
bun add framer-motion

# npm を使う場合
npm install framer-motion
Framer Motion はアニメーションライブラリです。Next.js 14.x では App Router と組み合わせる際に少し工夫が必要です。 
imcorfitz.com

2. components/layout-transition.tsx の作成
以下の３つの要素を同一ファイルに実装します。

usePreviousValue フック
前回の値を保持するカスタムフック。アンマウント時にリセットします。

FrozenRouter コンポーネント
Next.js の内部コンテキスト LayoutRouterContext を使い、レイアウトのセグメント（パスの区切り単位）が変わったときだけコンテキストを更新することで、コンポーネントの急なアンマウント／マウントを防ぎます。

LayoutTransition コンポーネント
Framer Motion の AnimatePresence ＋ motion.div でアニメーションをラップし、キーには現在のレイアウトセグメントを使用します。また子要素を FrozenRouter で包んでコンテキストを安定化させます。

// components/layout-transition.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useSelectedLayoutSegment,
  useContext,
} from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect, useRef } from "react";

/** 前回の値を保持するフック */
function usePreviousValue<T>(value: T): T | undefined {
  const prev = useRef<T>();
  useEffect(() => {
    prev.current = value;
    return () => { prev.current = undefined; };
  });
  return prev.current;
}

/** コンテキストを“凍結”して急な更新を防ぐ */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) || null;
  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);

  const changed =
    segment !== prevSegment &&
    segment !== undefined &&
    prevSegment !== undefined;

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext : context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

/** ページ遷移用コンポーネント */
interface LayoutTransitionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  initial: any;
  animate: any;
  exit: any;
}
export function LayoutTransition({
  children,
  className,
  style,
  initial,
  animate,
  exit,
}: LayoutTransitionProps) {
  const segment = useSelectedLayoutSegment();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        className={className}
        style={style}
        initial={initial}
        animate={animate}
        exit={exit}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
useSelectedLayoutSegment() で取得できる「レイアウトセグメント」をキーにすることで、パス全体ではなく、セグメント単位でアニメーションを制御できます。

FrozenRouter がコンテキスト更新を凍結し、アンマウント／マウントによるアニメーション中断を防ぎます。 
imcorfitz.com

3. app/layout.tsx に組み込む
最後に、ルートレイアウトで先ほどの LayoutTransition を使います。

// app/layout.tsx
import "./globals.css";
import { LayoutTransition } from "@/components/layout-transition";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <LayoutTransition
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {children}
        </LayoutTransition>
      </body>
    </html>
  );
}
initial, animate, exit の値はお好みで調整してください。

mode="wait" により「前ページの exit が終わってから次ページの enter」を実現しています。

これで、Next.js の App Router 環境下でもスムーズなページ遷移アニメーションが実現できます。


ChatGPT に質問する



選択されていません選択されていません
ChatGPT の回答は必ずしも正しいとは限りません。重要な情報は確認するようにしてください。
`}
                <Button style={{ alignSelf: 'center' }} onClick={handleButtonClick}>
                    {user ? user.nickName : "Sign In"}
                </Button>
    
            </PageBox>
  );
}
