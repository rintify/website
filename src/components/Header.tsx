// app/components/Header/Header.tsx
"use client";

import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

// ── Styled Components ──

// 1) 右上の円形アイコンボタン
const IconButton = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  z-index: 100;
`;

// 2) スライドインするメニュー
const MenuOverlay = styled(animated.div)`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 90;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  overflow: hidden;
`;

// 3) メニュー内のリンク
const MenuItem = styled.a`
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-decoration: none;
  color: #333;

  &:hover {
    color: #000;
  }
`;

export default function Header() {
  const [open, setOpen] = useState(false);

  // width を 0 ⇔ 250px でアニメーション
  const springStyle = useSpring({
    width: open ? 250 : 0,
    config: { tension: 250, friction: 30 },
  });

  return (
    <>
      {/* 円形アイコンボタン */}
      <IconButton onClick={() => setOpen((o) => !o)}>
        <Image
          src={''}
          alt="メニューを開く"
          fill
          style={{ objectFit: "cover" }}
        />
      </IconButton>

      {/* スライドメニュー */}
      <MenuOverlay style={springStyle}>
        <nav>
          <Link href="/" passHref>
            <MenuItem onClick={() => setOpen(false)}>ホーム</MenuItem>
          </Link>
          <Link href="/about" passHref>
            <MenuItem onClick={() => setOpen(false)}>About</MenuItem>
          </Link>
          <Link href="/contact" passHref>
            <MenuItem onClick={() => setOpen(false)}>Contact</MenuItem>
          </Link>
          {/* 他のリンクも同様に追加 */}
        </nav>
      </MenuOverlay>
    </>
  );
}
