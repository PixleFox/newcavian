import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from '@/lib/auth-middleware';

const HERO_DIR = path.join(process.cwd(), 'uploads', 'hero-models');
const MODELS_DIR = path.join(process.cwd(), 'uploads', 'images', 'UI design Materails', 'Models');
const IMAGE_RE = /\.(png|jpg|jpeg|webp)$/i;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listDir(dir: string, urlPrefix: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => IMAGE_RE.test(f))
    .map(f => {
      const stat = fs.statSync(path.join(dir, f));
      return {
        filename: f,
        url: `${urlPrefix}${encodeURIComponent(f)}`,
        createdAt: stat.mtime.toISOString(),
        source: 'uploaded' as const,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function GET() {
  ensureDir(HERO_DIR);

  const uploaded = listDir(HERO_DIR, '/api/uploads/hero-models/');

  // Fall back to Models folder if nothing uploaded yet
  if (uploaded.length === 0) {
    const defaults = listDir(
      MODELS_DIR,
      '/api/uploads/images/UI%20design%20Materails/Models/',
    ).map(f => ({ ...f, source: 'default' as const }));
    return NextResponse.json({ success: true, data: defaults });
  }

  return NextResponse.json({ success: true, data: uploaded });
}

export async function POST(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  ensureDir(HERO_DIR);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, error: 'فایلی ارسال نشد' }, { status: 400 });

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ success: false, error: 'فقط PNG، JPG، WEBP مجاز است' }, { status: 400 });

    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ success: false, error: 'حجم فایل بیش از ۱۰ مگابایت است' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(HERO_DIR, filename), buffer);

    return NextResponse.json({
      success: true,
      data: { filename, url: `/api/uploads/hero-models/${filename}` },
    });
  } catch (err) {
    console.error('Hero model upload error:', err);
    return NextResponse.json({ success: false, error: 'خطا در آپلود فایل' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  try {
    const { filename } = await request.json();
    if (!filename || typeof filename !== 'string' || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ success: false, error: 'نام فایل نامعتبر است' }, { status: 400 });
    }

    const filePath = path.join(HERO_DIR, filename);
    if (!filePath.startsWith(HERO_DIR + path.sep)) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Hero model delete error:', err);
    return NextResponse.json({ success: false, error: 'خطا در حذف فایل' }, { status: 500 });
  }
}
