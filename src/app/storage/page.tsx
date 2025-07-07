'use client'

import { HeaderMargine } from '@/components/Header'
import { uploadFile, useFileContent, useFiles, useSessionUser } from '@/lib/api'
import { useState, useEffect, useCallback } from 'react'

export default function FileViewer() {
  const { session, sessionLoading } = useSessionUser()
  const { files, filesLoading, mutateFiles } = useFiles(session?.id, 'private')
  const [error, setError] = useState<string>('')
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const { content, fileContentLoading, mutateFileContent } = useFileContent(session?.id, selected, 'private')

  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!session || !file) return

    await uploadFile(session.id, 'private', file)
    mutateFiles()
  }

  useEffect(() => {
    mutateFileContent()
  }, [selected])

  return (
    <>
      <HeaderMargine />
    </>
  )
}
