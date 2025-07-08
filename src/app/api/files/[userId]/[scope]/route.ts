// app/api/files/[userId]/[scope]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { safeUploadsPath, requireAuth } from '@/lib/nextauth-server';
import fs from 'fs';
import path from 'path';
import base64url from 'base64url';
import { fileTypeFromBuffer } from 'file-type';

export async function GET(
  req: NextRequest,
  { params }: NextParams
) {
  const { userId, scope } = await params;

  if (scope === 'private') {
    const user = await requireAuth();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const uploadsDir = safeUploadsPath(userId, scope)
  if (!uploadsDir) {
    return NextResponse.json([], { status: 200 })
  }

  const files = fs.readdirSync(uploadsDir).map(f => {
    const fileName = base64url.decode(f)
    const filePath = path.join(uploadsDir, f)
    const stats = fs.statSync(filePath)
    return {
      name: fileName,
      size: stats.size,
    }
  })
  return NextResponse.json(files);
}


export async function POST(
  req: NextRequest,
  { params }: NextParams
) {
  const { userId, scope } = await params;

  const user = await requireAuth();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'ファイルを指定してください' }, { status: 400 });
  }

  if (file.name.length > 50) {
    return NextResponse.json(
      { error: 'ファイル名は50文字以下にしてください' },
      { status: 400 }
    );
  }

  if (!['private', 'icons'].includes(scope)) {
    return NextResponse.json({ error: '不正なスコープです' }, { status: 400 });
  }

  const filename = scope === 'icons' ? 'icon.png' : base64url.encode(file.name)

  const baseDir = path.join(process.cwd(), 'uploads', userId, scope);
  await fs.promises.mkdir(baseDir, { recursive: true });

  const filepath = path.join(baseDir, filename);

  const reader = file.stream().getReader();
  const MAX = scope === 'icons' ? 100 * 1024 : 10 * 1024 * 1024;
  const DirMAX = 20 * 1024 * 1024;
  let total = 0;
  let dirTotal = await getDirectorySize(baseDir);
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX) {
      reader.cancel();
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます' },
        { status: 400 }
      );
    }
    dirTotal += value.byteLength
    if (dirTotal > DirMAX) {
      reader.cancel();
      return NextResponse.json(
        { error: 'ストレージ上限を超えています' },
        { status: 400 }
      );
    }
    chunks.push(value);
  }

  const buf = Buffer.concat(chunks.map(u8 => Buffer.from(u8)), total)
  const type = await fileTypeFromBuffer(buf);

  if (scope === 'icons' && (!type || !type.mime.startsWith('image/'))) {
    return NextResponse.json({ error: '画像ファイルを指定してください' }, { status: 400 });
  }

  await fs.promises.writeFile(filepath, buf);
  return NextResponse.json({ url: 'aaa' });
}


async function getDirectorySize(dir: string): Promise<number> {
  let total = 0;
  const files = await fs.promises.readdir(dir);
  await Promise.all(files.map(async file => {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isFile()) total += stat.size;
  }));
  return total;
}