import React, { ReactNode } from "react";
import { useSpring, animated } from "@react-spring/web";

type ButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export default function Button({
  children,
  onClick,
  style = {},
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const spStyle = useSpring({
    transform: pressed
      ? "scale(0.9)"
      : hovered
      ? "scale(1.1)"
      : "scale(1)",
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.div
      style={{
        padding: "8px 16px",
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
        display: "inline-block",
        userSelect: "none",
        ...spStyle,
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
