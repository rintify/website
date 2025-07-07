'use client';
import React, {
  ReactNode,
  useRef,
  useLayoutEffect,
  useState,
  CSSProperties,
} from 'react';
import { useSpring, animated, AnimatedProps } from '@react-spring/web';

type ButtonProps = {
  line?: true;
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  scaleRatio?: number;
};

export default function ButtonDiv({
  line,
  children,
  onClick,
  style = {},
  scaleRatio = 1
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const { scale, dash, dashH } = useSpring({
    scale: pressed ? 0.9 : hovered ? 1.15 : 1,
    dash: pressed || hovered ? 10 : 5,
    dashH: pressed ? 2 : 1,
    config: { tension: 300, friction: 10 },
  });

  return (
    <animated.div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        cursor: 'pointer',
        transform: scale.to((s) => `scale(${1 + scaleRatio*(s - 1)})`),
        ...(line && {
          backgroundSize: dashH.to((d) => `8px ${d}px`),
          backgroundRepeat: 'repeat-x',
          backgroundPosition: '0 100%',
          paddingBottom: '0px',
          backgroundImage: dash.to(
            (d) =>
              `repeating-linear-gradient(to right, black 0 ${d}px, transparent ${d}px ${d * 2}px)`
          ),
        }),
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
    >
      {children}
    </animated.div>
  );
}
