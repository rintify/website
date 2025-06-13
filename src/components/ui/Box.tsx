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
  // direction が指定されていれば flex コンテナに
  const flexStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: row ? 'row' : 'column',
    gap: '0.5rem',
  }

  return (
    <div {...rest} style={{ ...flexStyles, ...style }}>
      {children}
    </div>
  );
}
