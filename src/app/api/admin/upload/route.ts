import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { authenticateAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, error: 'فایلی ارسال نشد' }, { status: 400 });

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ success: false, error: 'فرمت فایل مجاز نیست' }, { status: 400 });

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ success: false, error: 'حجم فایل بیش از ۵ مگابایت است' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'images');

    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/api/images/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: 'خطا در آپلود فایل' }, { status: 500 });
  }
}
