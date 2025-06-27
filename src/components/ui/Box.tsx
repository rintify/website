// app/components/Box.tsx
import React, { HTMLAttributes, ReactNode } from "react";

type BoxProps = {
  row?: boolean
  children: ReactNode
  style?: React.CSSProperties;

};

export default function Box({
  row,
  children,
  style = {},
  ...rest
}: BoxProps) {

  return (
    <div {...rest} style={{
      display: "flex",
      flexDirection: row ? 'row' : 'column',
      gap: '0.5rem',
       ...style
    }}>
      {children}
    </div>
  );
}
