// app/api/files/[userId]/[scope]/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { safeUploadsPath, requireAuth } from '@/lib/nextauth-server';
import { promises as fsPromises, createReadStream } from 'fs';
import mime from 'mime-types';
import base64url from 'base64url';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: NextParams
) {
  const { userId, scope, filename } = await params;

  if (scope === 'private') {
    const user = await requireAuth();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const filepath = safeUploadsPath(userId, scope, filename)
  if (!filepath) {
    return NextResponse.json({ error: '不正なファイルパスです' }, { status: 400 });
  }

  const stat = await fsPromises.stat(filepath);
  const size = stat.size;
  const contentType = mime.lookup(filepath) || 'application/octet-stream';

  if (size < 2 * 1024 * 1024) {
    const data = await fsPromises.readFile(filepath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': size.toString(),
      },
    });
  }

  const fileStream = createReadStream(filepath);

  return new NextResponse(fileStream as any, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': size.toString(),
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: NextParams
) {
  const { userId, scope, filename } = await params;

  const user = await requireAuth();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!['private'].includes(scope)) {
    return NextResponse.json({ error: '不正なスコープです' }, { status: 400 });
  }


  const safeDir = safeUploadsPath(userId, scope);
  if (!safeDir) {
    return NextResponse.json({ error: '不正なファイルパスです' }, { status: 400 });
  }

  const storedName = base64url.encode(filename);

  const filePath = path.join(safeDir, storedName);

  try {
    await fsPromises.stat(filePath);
  } catch {
    return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 });
  }

  try {
    await fsPromises.unlink(filePath);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '削除中できませんでした' }, { status: 500 });
  }
}