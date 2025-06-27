// app/api/files/[userId]/[scope]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { safeUploadsPath, requireAuth } from '@/lib/nextauth-server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; scope: string } }
) {
  const { userId, scope } = params;

  if (scope === 'private') {
    const user = await requireAuth();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const path = safeUploadsPath(userId, scope)
  if (!path) {
    return NextResponse.json([], { status: 200 });
  }

  const files = fs.readdirSync(path);
  return NextResponse.json(files);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string; scope: string } }
) {
  const { userId, scope } = params;

  if (scope !== 'private') {
    return NextResponse.json({ error: 'Scope must be private' }, { status: 400 });
  }

  const user = await requireAuth();
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const ext = path.extname(file.name).toLowerCase();
  const ALLOWED = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  if (!ALLOWED.includes(ext)) {
    return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 });
  }

  const { ulid } = await import('ulid');
  const filename = ulid() + ext;

  const baseDir = path.join(process.cwd(), 'uploads', userId, 'private');
  await fs.promises.mkdir(baseDir, { recursive: true });

  const filepath = path.join(baseDir, filename);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(filepath, buf);

  const url = `/api/files/${userId}/private/${filename}`;
  return NextResponse.json({ url });
}
