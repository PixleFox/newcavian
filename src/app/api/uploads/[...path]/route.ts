import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.join(process.cwd(), 'uploads', ...segments);

  if (!filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime: Record<string, string> = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  };

  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
