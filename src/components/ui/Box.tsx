// app/components/Box.tsx
"use client";
import React, { HTMLAttributes, ReactNode } from "react";
import styled from "styled-components";

type BoxProps = {
  row?: boolean
  children: ReactNode
  style?: React.CSSProperties;
};

export default function Box({
  row,
  children,
  style = {},
}: BoxProps) {

  return (
    <div style={{
      display: "flex",
      flexDirection: row ? 'row' : 'column',
      gap: '0.5rem',
       ...style
    }}>
      {children}
    </div>
  );
}



export const Large = styled.div`
  font-size: 1.8rem;
  color: #000;
  line-height: 1.2;
  min-height: 1.2em;
`

export const Medium = styled.div`
  font-size: 1rem;
  color: #000;
  line-height: 1.2;
  min-height: 1.2em;
`

export const Small = styled.div`
  font-size: 0.8rem;
  color: #0008;
  line-height: 1.2;
  min-height: 1.2em;
`