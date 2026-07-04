// src/app/api/images/[filename]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { filename } = request.nextUrl.pathname.split('/').pop() ? 
    { filename: request.nextUrl.pathname.split('/').pop() as string } : 
    { filename: '' };

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'uploads', 'images', filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    }[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}