// app/api/files/[userId]/[scope]/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { safeUploadsPath, requireAuth } from '@/lib/nextauth-server';
import { promises as fsPromises, createReadStream } from 'fs';
import mime from 'mime-types';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; scope: string; filename: string } }
) {
  const { userId, scope, filename } = params;

  if (scope === 'private') {
    const user = await requireAuth();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const filepath = safeUploadsPath(userId, scope, filename);
  if (!filepath) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  const stat = await fsPromises.stat(filepath);
  const size = stat.size;
  const contentType = mime.lookup(filepath) || 'application/octet-stream';

  const INLINE_THRESHOLD = 512 * 1024; // 512 KB
  if (size < INLINE_THRESHOLD) {
    const data = await fsPromises.readFile(filepath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': size.toString(),
      },
    });
  }

  const nodeStream = createReadStream(filepath);
  const webStream = nodeToWeb(nodeStream);
  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
    },
  });
}

function nodeToWeb(nodeStream: NodeJS.ReadableStream): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on('data', (chunk: Buffer) => controller.enqueue(chunk));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', err => controller.error(err));
    }
  });
}
