import { useState } from 'react'
import { ModalBox } from './Box'
import { FileBox } from './FileBox'
import { LoadingCover } from './LoadingBar'
import imageCompression from 'browser-image-compression'

interface IconEditModalProps {
  title: string
  uploadFunction: (file: File) => Promise<{ ok: boolean; error?: string }>
  onSuccess?: () => void
  modalKey: string
  popModal: (key: string) => void
}

export function IconEditModal({ title, uploadFunction, onSuccess, modalKey, popModal }: IconEditModalProps) {
  const [iconFile, setIconFile] = useState<File | undefined>()
  const [progress, setProgress] = useState(1)

  return (
    <ModalBox
      title={title}
      actions={async () => {
        setProgress(0)
        let res
        if (iconFile) {
          let compressedFile = iconFile
          try {
            for (let i = 0; i < 5; i++) {
              compressedFile = await imageCompression(compressedFile, {
                onProgress: a => setProgress(0.9 * a / 100),
                maxSizeMB: 0.05,
                maxWidthOrHeight: 256,
                useWebWorker: true,
              })
              if (compressedFile.size <= 50 * 1024) break
            }
          } catch {
            setProgress(1)
            return '画像ファイルを指定してください'
          }
          res = await uploadFunction(compressedFile)
          setProgress(1)
          if (!res.ok) return res.error
        }

        popModal(modalKey)
        if (res?.ok) onSuccess?.()
      }}
    >
      <FileBox
        files={iconFile}
        fullDrop
        style={{ alignSelf: 'center', width: '15rem', height: '8rem' }}
        onChange={files => setIconFile(files[0])}
      />
      <LoadingCover list={[{ progress: progress, message: '画像を圧縮中' }]} />
    </ModalBox>
  )
}