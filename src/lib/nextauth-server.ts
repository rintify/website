// lib/nextauth-server.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) return

    return session.user;
}

export function safeUploadsPath(...seg: string[]) {
    const baseDir = path.join(process.cwd(), 'uploads');
    let filepath = path.join(baseDir, ...seg);
    filepath = path.normalize(filepath);

    if (!filepath.startsWith(baseDir + path.sep)) return

    if (!fs.existsSync(filepath)) return

    return filepath
}