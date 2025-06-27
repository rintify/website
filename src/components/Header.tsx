"use client"

import React, { useEffect, useRef, useState } from "react";
import styled from '@emotion/styled';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@/hooks/useUser";

export const HeaderMargine = () => {
    return <div style={{ height: '4rem' }} />
}


const menuItems: { menu: string, link: string }[] = [
    { menu: "Top", link: "/" },
    { menu: "Craft", link: "/craft" },
    { menu: "to Memory", link: "/memory" },
    { menu: "to PDF", link: "/edit/toPDF" },
    { menu: "Note", link: "/note" }
]


const Header: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [item, setItem] = useState<typeof menuItems[0] | undefined>(undefined)

    const lastScrollY = useRef(0);

    const user = useUser()
    const [showHeader, setShowHeader] = useState(true);

    useEffect(() => {
        setItem(menuItems.find(e => e.link == pathname))
        setIsMenuOpen(false)
    }, [pathname])

    const openMenu = () => {
        if (isMenuOpen) return
        setIsMenuOpen(true);
        document.body.classList.remove('no-scroll');
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY <= 1) {
            }
            else if (currentScrollY > lastScrollY.current) {
                if (showHeader) setShowHeader(false);
                if (isMenuOpen) setIsMenuOpen(false)
            }
            else if (currentScrollY < lastScrollY.current) {
                if (!showHeader) setShowHeader(true);
                if (isMenuOpen) setIsMenuOpen(false)
            }
            lastScrollY.current = currentScrollY; // スクロール位置を更新
        };

        // スクロールイベントを追加
        window.addEventListener('scroll', handleScroll);

        return () => {
            // コンポーネントのアンマウント時にイベントを削除
            window.removeEventListener('scroll', handleScroll);
        };
    });


    const isDefault = !item || item.link == '/'

    return (
        <div
            style={{
                position: 'fixed',
                top: '0px',
                width: '100%',
                transform: showHeader ? 'translateY(0)' : 'translateY(-4rem)',
                transition: 'transform 0.3s ease-in-out',
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: '0.8rem',
                left: '0.9rem',
                width: '100%'
            }}>
                <div style={{
                    color: "#000",
                    userSelect: 'none',
                    marginLeft: isDefault ? 0 : '0.1rem',
                    fontSize: isDefault ? '1.3rem' : '0.6rem',
                    transition: 'all 0.3s ease',
                }}>RI-N.com</div>

                <div style={{
                    color: "#000",
                    userSelect: 'none',
                    fontSize: isDefault ? 0 : '1.3rem',
                    maxHeight: isDefault ? '0px' : '50px',  // 非表示の場合は高さ0に
                    transition: 'font-size 0.3s ease, max-height 0.3s ease', // スムーズに表示/非表示
                    height: '1.5rem',
                    position: 'relative'
                }}>
                    <AnimatePresence>
                        <motion.span
                            key={item?.menu} // 重要: keyをitem.textにすることで、テキストが変わるたびにアニメーションをトリガー
                            initial={{ opacity: 0, bottom: '-10px' }}
                            animate={{ opacity: 1, bottom: '0px' }}
                            exit={{ opacity: 0, bottom: '10px' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ position: "absolute" }}
                        >{item && item != menuItems[0] ? item.menu : ''}</motion.span>
                    </AnimatePresence>
                </div>

            </div>

            {!isMenuOpen ? null : <div style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
            }}
                onClick={e => setIsMenuOpen(false)}></div>
            }

            <div
                style={{
                    userSelect: 'none',
                    position: 'fixed',
                    top: 0,
                    right: isMenuOpen ? '0' : '-14rem',
                    width: '13rem',
                    height: '100vh',
                    background: '#fffe',
                    borderLeft: '1px solid #fff0',
                    boxShadow: '-5px 0px 15px rgba(0, 0, 0, 0.1)',
                    paddingLeft: '0.2rem',
                    paddingTop: '4rem',
                    paddingRight: '0.8rem',
                    transition: 'right 300ms ease',
                }}
            >
                {menuItems.map((item, index) => (
                    <Link key={index} href={item.link}>
                        <div style={{
                            padding: '10px',
                            color: 'black',
                            width: 'fit-content',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}>
                            {item.menu}
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1.5rem',
                width: '1.85rem',
                height: '1.85rem',
                cursor: 'pointer'
            }}
                id="mb" onClick={isMenuOpen ? () => setIsMenuOpen(false) : openMenu}>
                <Line id="mb" isOpen={isMenuOpen} />
                <Line id="mb" isOpen={isMenuOpen} />
                <Line id="mb" isOpen={isMenuOpen} />
            </div>

            <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '4.5rem',
                width: isMenuOpen ? '5.5rem' : 0,
                overflow: 'hidden',
                transition: 'width 300ms ease',
                color: 'black',
                fontSize: '0.8rem',
                direction: 'rtl',
                userSelect: 'none',
                cursor: "pointer",
            }}>
                <div
                    style={{
                        width: "5.5rem",
                        direction: "initial",
                        paddingLeft: "1rem",
                        whiteSpace: "nowrap",
                        minHeight: '0.5rem',
                    }}
                    onClick={() => {
                        if (user) router.push("/api/auth/logout"); // クライアントサイドでログアウト
                        else router.push("/api/auth/login"); // クライアントサイドでログイン
                    }}
                >
                    {user ? user.name ?? "User" : "Login"}
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: isMenuOpen ? '9.2rem' : '3.7rem',
                transition: 'right 300ms ease',
                color: 'black',
                display: 'flex',
                alignItems: 'center',
                userSelect: 'none'
            }}>
                <div
                    onClick={() => { }}
                    style={{
                        width: '2rem', // サイズを調整
                        height: '2rem',
                        borderRadius: '50%', // 円形にする
                        overflow: 'hidden', // アイコンがボタン外に出ないようにする
                        border: '1px solid #0001', // 必要に応じて枠線を追加
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0.5rem'
                    }}
                >
                    <img
                        src={user?.icon}
                        alt="menu icon"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover', // アイコンを中央に収める
                            filter: "saturate(1)"
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

const Line = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  width: 100%;
  height: 1px;
  background-color: black;
  transition: all 0.3s ease;

  &:nth-of-type(1) {
    top: ${props => props.isOpen ? '50%' : '21%'};
    transform: ${props => props.isOpen ? 'rotate(45deg)' : 'none'};
  }

  &:nth-of-type(2) {
    top: ${props => props.isOpen ? '50%' : '50%'};
    transform: ${props => props.isOpen ? 'rotate(-45deg)' : 'none'};
  }

  &:nth-of-type(3) {
    top: ${props => props.isOpen ? '50%' : '79.5%'};
    transform: ${props => props.isOpen ? 'rotate(45deg)' : 'none'};
  }
`;

export default Header;