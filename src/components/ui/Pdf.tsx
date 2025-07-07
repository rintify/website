'use client'

import React, { useEffect, useState } from 'react'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

type Props = { file: File }

export default function PdfPreview({ file }: Props) {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null)

  // File → ArrayBuffer に変換
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) setBuffer(e.target.result as ArrayBuffer)
    }
    reader.readAsArrayBuffer(file)
  }, [file])

  if (!buffer) return null

  return (
    <div
      style={{
        width: '4rem',
        height: '4rem',
        overflow: 'hidden',
        borderRadius: 4,
      }}
    >
      <Document >
      </Document>
    </div>
  )
}
