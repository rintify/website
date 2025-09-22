import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { promises as fsPromises, createReadStream } from 'fs'
import mime from 'mime-types'
import { fileTypeFromBuffer } from 'file-type'

const fileRegex = /^(?:[A-Za-z0-9_.-]|%[0-9A-Fa-f]{2})+$/

export async function _GET(...pathSegments: string[]) {
  const filepath = safeUploadsPath(...pathSegments)
  if (!filepath) {
    return NextResponse.json({ error: '不正なファイルパスです' }, { status: 400 })
  }

  const stat = await fsPromises.stat(filepath)

  if (stat.isDirectory()) {
    const files = await getDirFiles(filepath)
    return new NextResponse(JSON.stringify(files), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Resource-Kind': 'directory',
      },
    })
  }

  const size = stat.size
  const contentType = mime.lookup(filepath) || 'application/octet-stream'

  if (size < 2 * 1024 * 1024) {
    const data = await fsPromises.readFile(filepath)
    return new NextResponse(data as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': size.toString(),
        'X-Resource-Kind': 'file',
      },
    })
  }

  const fileStream = createReadStream(filepath)

  return new NextResponse(fileStream as any, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': size.toString(),
      'X-Resource-Kind': 'file',
    },
  })
}

export async function _DELETE(...pathSegments: string[]) {
  const filepath = safeUploadsPath(...pathSegments)
  if (!filepath) {
    return NextResponse.json({ error: '不正なファイルパスです' }, { status: 400 })
  }

  if (await deleteAnyFile(filepath)) return NextResponse.json({ success: true }, { status: 200 })
  return NextResponse.json({ error: '削除に失敗しました' }, { status: 400 })
}

export async function _POST({
  form,
  dirMaxSize = Infinity,
  fileMaxSize,
  pathSegments,
  filename,
  typePrefix,
}: {
  form: FormData
  dirMaxSize?: number
  fileMaxSize: number
  pathSegments: string[]
  filename?: string
  typePrefix?: string
}) {

  let actualPathSegments = pathSegments
  let actualFilename = filename

  if (!filename && pathSegments.length > 0) {

    actualPathSegments = pathSegments.slice(0, -1)
    actualFilename = pathSegments[pathSegments.length - 1]
  }

  const baseDir = safeUploadsPathForWrite(...actualPathSegments)
  if (!baseDir) {
    return NextResponse.json({ error: '不正なファイルパスです' }, { status: 400 })
  }
  await fs.promises.mkdir(baseDir, { recursive: true })

  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ success: true }, { status: 200 })

  const encodedFilename = actualFilename ? encodeURIComponent(actualFilename) : encodeURIComponent(file.name)
  if (!fileRegex.test(encodedFilename) || encodedFilename.length > 255) {
    return NextResponse.json({ error: 'ファイル名が不正です' }, { status: 400 })
  }

  const filepath = path.join(baseDir, encodedFilename)

  const reader = file.stream().getReader()
  let total = 0
  let dirTotal = await getDirectorySize(baseDir)
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > fileMaxSize) {
      reader.cancel()
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます' }, { status: 400 })
    }
    dirTotal += value.byteLength
    if (dirTotal > dirMaxSize) {
      reader.cancel()
      return NextResponse.json({ error: 'ストレージ上限を超えています' }, { status: 400 })
    }
    chunks.push(value)
  }

  const buf = Buffer.concat(
    chunks.map(u8 => Buffer.from(u8)),
    total
  )

  if (typePrefix !== undefined) {
    const type = await fileTypeFromBuffer(buf)
    if (!type || !type.mime.startsWith(typePrefix)) {
      return NextResponse.json({ error: '画像ファイルを指定してください' }, { status: 400 })
    }
  }

  await fs.promises.writeFile(filepath, buf)
  return NextResponse.json({ success: true }, { status: 200 })
}

export async function getDirectorySize(dir: string): Promise<number> {
  let total = 0
  const files = await fs.promises.readdir(dir)
  await Promise.all(
    files.map(async file => {
      const filePath = path.join(dir, file)
      const stat = await fs.promises.stat(filePath)
      if (stat.isFile()) total += stat.size
    })
  )
  return total
}

export async function getDirFiles(filepath: string) {
  const entries = await fsPromises.readdir(filepath, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async dirent => {
      const encoded = dirent.name
      const filePath = path.join(filepath, encoded)
      const decodedName = (() => {
        try {
          return decodeURIComponent(encoded)
        } catch {
          return null
        }
      })()
      if (!decodedName) return null

      if (dirent.isDirectory()) {
        return {
          name: decodedName,
          size: 0,
          kind: 'directory' as const,
          contentType: 'inode/directory',
        }
      } else {
        const st = await fsPromises.stat(filePath)
        const ct = mime.lookup(filePath) || 'application/octet-stream'
        return {
          name: decodedName,
          size: st.size,
          kind: 'file' as const,
          contentType: ct,
        }
      }
    })
  )

  return files.filter(f => !!f)
}

export async function deleteAnyFile(filepath: string) {
  const st = await fsPromises.stat(filepath)
  if (st.isDirectory()) {
    await fsPromises.rm(filepath, { recursive: true, force: true })
  }

  await fsPromises.unlink(filepath)
  return true
}

export function safeUploadsPath(...pathSegments: string[]) {
  if (pathSegments.length === 0) return

  const encodedSegments = pathSegments.map(s => encodeURIComponent(s))

  for (const s of encodedSegments) {
    if (!fileRegex.test(s)) return
  }

  const baseDir = path.resolve(process.cwd(), 'uploads')
  const filepath = path.resolve(baseDir, ...encodedSegments)

  if (!fs.existsSync(filepath)) return

  return filepath
}

export function safeUploadsPathForWrite(...pathSegments: string[]) {
  if (pathSegments.length === 0) return

  const encodedSegments = pathSegments.map(s => encodeURIComponent(s))
  
  for (const s of encodedSegments) {
    if (!fileRegex.test(s)) return
  }

  const baseDir = path.resolve(process.cwd(), 'uploads')
  const filepath = path.resolve(baseDir, ...encodedSegments)

  if (!fs.existsSync(baseDir)) return

  if (!filepath.startsWith(baseDir + path.sep) && filepath !== baseDir) return

  return filepath
}
