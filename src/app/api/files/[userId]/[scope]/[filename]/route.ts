// pages/api/files/[userId]/[filename].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mime from 'mime-types';
import { requireAuth } from '@/lib/nextauth-server';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, scope, filename } = req.query as { userId: string; scope: string; filename: string };

  if (scope != 'public') {
    const user = await requireAuth(req, res);
    if (!user || user.id !== userId) return res.status(403).end('Forbidden');
  }

  const baseDir = path.join(process.cwd(), 'uploads');
  let filepath = path.join(baseDir, userId, scope, filename);
  filepath = path.normalize(filepath);

  if (!filepath.startsWith(baseDir + path.sep)) 
    return res.status(400).end('Invalid file path');

  if (!fs.existsSync(filepath)) return res.status(404).end('Not Found');

  res.setHeader('Content-Type', mime.lookup(filepath) || 'application/octet-stream');
  fs.createReadStream(filepath).pipe(res);
}
