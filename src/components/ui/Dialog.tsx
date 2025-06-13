// app/components/Dialog.tsx
import React, { CSSProperties } from "react";
import { useTransition, animated } from "@react-spring/web";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: CSSProperties
};

export default function Dialog({ open, onClose, children, style }: DialogProps) {
  // open の true/false に合わせて transition を設定
  const transitions = useTransition(open, {
    from: { opacity: 0, transform: "scale(0)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0)" },
    config: { tension: 300, friction: 20 },
  });

  return (
    <>
      {transitions(
        (styles, item) =>
          item && (
            // Animated wrapper
            <animated.div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: styles.opacity,
                pointerEvents: open ? "auto" : "none",

              }}
              onClick={onClose}
            >
              <animated.div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#fff",
                  borderRadius: 2,
                  minWidth: 280,
                  transform: styles.transform,
                  boxShadow: "0 0 10px #0002",
                  display: 'flex',
                  padding: '1rem',
                  boxSizing: 'border-box',
                  ...style
                }}
              >
                  {children}
              </animated.div>
            </animated.div>
          )
      )}
    </>
  );
}
