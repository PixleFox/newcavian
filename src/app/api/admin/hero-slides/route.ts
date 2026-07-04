import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { authenticateAdmin } from '@/lib/auth-middleware';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  imageFile: string;
  tag: string;
  title: string;
  titleAccent: string;
  body: string;
  neon: string;
  neonInk: string;
  order: number;
}

const SLIDES_FILE = path.join(process.cwd(), 'uploads', 'hero-slides.json');
const IMG_DIR     = path.join(process.cwd(), 'uploads', 'hero-models');

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 'default-1', imageUrl: '', imageFile: '', tag: 'سایبرپانک',    title: 'آینده را',   titleAccent: 'به تن کن',          body: 'کالکشن سایبرپانک — نئون، شب و خیابان‌های آینده',       neon: '#22d3ee', neonInk: '#0e7490', order: 0 },
  { id: 'default-2', imageUrl: '', imageFile: '', tag: 'پینک فلوید',    title: 'صدا را',     titleAccent: 'بپوش',              body: 'کالکشن Pink Floyd — برای کسایی که واقعاً گوش می‌دن',   neon: '#f43f5e', neonInk: '#be123c', order: 1 },
  { id: 'default-3', imageUrl: '', imageFile: '', tag: 'دون · آراکیس', title: 'ادویه',      titleAccent: 'هدیهٔ زندگیه',      body: 'کالکشن Dune — صحرای آراکیس روی سینه‌ات',              neon: '#fbbf24', neonInk: '#b45309', order: 2 },
  { id: 'default-4', imageUrl: '', imageFile: '', tag: 'ارباب حلقه‌ها', title: 'یک حلقه',   titleAccent: 'فرمانروای همه',      body: 'کالکشن Middle-Earth — برای فن‌های واقعی',              neon: '#a855f7', neonInk: '#7c3aed', order: 3 },
  { id: 'default-5', imageUrl: '', imageFile: '', tag: 'ایران باستان',  title: 'تاریخ را',   titleAccent: 'حمل کن',            body: 'کالکشن کوروش — افتخار ایران روی تن تو',               neon: '#34d399', neonInk: '#047857', order: 4 },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSlides(): HeroSlide[] {
  if (!fs.existsSync(SLIDES_FILE)) return [...DEFAULT_SLIDES];
  try {
    const raw = JSON.parse(fs.readFileSync(SLIDES_FILE, 'utf-8'));
    return Array.isArray(raw) ? raw.sort((a, b) => a.order - b.order) : [...DEFAULT_SLIDES];
  } catch { return [...DEFAULT_SLIDES]; }
}

function writeSlides(slides: HeroSlide[]) {
  ensureDir(path.dirname(SLIDES_FILE));
  fs.writeFileSync(SLIDES_FILE, JSON.stringify(slides, null, 2), 'utf-8');
}

// GET — list all slides
export async function GET() {
  return NextResponse.json({ success: true, data: readSlides() });
}

// POST — create slide (multipart: optional file + JSON fields)
export async function POST(req: NextRequest) {
  const { error } = await authenticateAdmin(req);
  if (error) return error;

  ensureDir(IMG_DIR);
  const formData = await req.formData();

  const file = formData.get('file') as File | null;
  let imageUrl = '';
  let imageFile = '';

  if (file && file.size > 0) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return NextResponse.json({ success: false, error: 'فقط PNG، JPG، WEBP مجاز است' }, { status: 400 });
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    imageFile = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    fs.writeFileSync(path.join(IMG_DIR, imageFile), Buffer.from(await file.arrayBuffer()));
    imageUrl = `/api/uploads/hero-models/${imageFile}`;
  }

  const slides = readSlides();
  const newSlide: HeroSlide = {
    id:           randomUUID(),
    imageUrl:     imageUrl || (formData.get('imageUrl') as string) || '',
    imageFile,
    tag:          (formData.get('tag') as string) || '',
    title:        (formData.get('title') as string) || '',
    titleAccent:  (formData.get('titleAccent') as string) || '',
    body:         (formData.get('body') as string) || '',
    neon:         (formData.get('neon') as string) || '#a855f7',
    neonInk:      (formData.get('neonInk') as string) || '#7c3aed',
    order:        slides.length,
  };
  slides.push(newSlide);
  writeSlides(slides);

  return NextResponse.json({ success: true, data: newSlide });
}

// PUT — update slide (multipart: optional file + JSON fields)
export async function PUT(req: NextRequest) {
  const { error } = await authenticateAdmin(req);
  if (error) return error;

  ensureDir(IMG_DIR);
  const formData = await req.formData();
  const id = formData.get('id') as string;
  if (!id) return NextResponse.json({ success: false, error: 'id الزامی است' }, { status: 400 });

  const slides = readSlides();
  const idx = slides.findIndex(s => s.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'اسلاید یافت نشد' }, { status: 404 });

  const file = formData.get('file') as File | null;
  let imageUrl = slides[idx].imageUrl;
  let imageFile = slides[idx].imageFile;

  if (file && file.size > 0) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return NextResponse.json({ success: false, error: 'فقط PNG، JPG، WEBP مجاز است' }, { status: 400 });
    // Delete old file
    if (imageFile) {
      const oldPath = path.join(IMG_DIR, imageFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    imageFile = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    fs.writeFileSync(path.join(IMG_DIR, imageFile), Buffer.from(await file.arrayBuffer()));
    imageUrl = `/api/uploads/hero-models/${imageFile}`;
  }

  slides[idx] = {
    ...slides[idx],
    imageUrl,
    imageFile,
    tag:         (formData.get('tag') as string)         ?? slides[idx].tag,
    title:       (formData.get('title') as string)       ?? slides[idx].title,
    titleAccent: (formData.get('titleAccent') as string) ?? slides[idx].titleAccent,
    body:        (formData.get('body') as string)        ?? slides[idx].body,
    neon:        (formData.get('neon') as string)        ?? slides[idx].neon,
    neonInk:     (formData.get('neonInk') as string)     ?? slides[idx].neonInk,
  };
  writeSlides(slides);

  return NextResponse.json({ success: true, data: slides[idx] });
}

// DELETE — delete slide
export async function DELETE(req: NextRequest) {
  const { error } = await authenticateAdmin(req);
  if (error) return error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ success: false, error: 'id الزامی است' }, { status: 400 });

  const slides = readSlides();
  const slide = slides.find(s => s.id === id);
  if (!slide) return NextResponse.json({ success: false, error: 'اسلاید یافت نشد' }, { status: 404 });

  // Delete image file
  if (slide.imageFile) {
    const filePath = path.join(IMG_DIR, slide.imageFile);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  const updated = slides.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
  writeSlides(updated);

  return NextResponse.json({ success: true });
}

// PATCH — reorder (move up or down)
export async function PATCH(req: NextRequest) {
  const { error } = await authenticateAdmin(req);
  if (error) return error;

  const { id, direction } = await req.json() as { id: string; direction: 'up' | 'down' };
  const slides = readSlides();
  const idx = slides.findIndex(s => s.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 });

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= slides.length)
    return NextResponse.json({ success: false, error: 'خارج از محدوده' }, { status: 400 });

  [slides[idx], slides[swapIdx]] = [slides[swapIdx], slides[idx]];
  slides.forEach((s, i) => { s.order = i; });
  writeSlides(slides);

  return NextResponse.json({ success: true, data: slides });
}
