import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('user-auth')?.value;
  if (!token) return null;
  try { return (jwt.verify(token, JWT_SECRET) as any).userId; } catch { return null; }
}

// POST /api/user/coupon  body: { code, total }
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 });

  const { code, total } = await req.json();
  if (!code) return NextResponse.json({ error: 'کد تخفیف الزامی است' }, { status: 400 });

  const disc = await (prisma as any).discount.findUnique({ where: { code: code.toUpperCase() } });

  if (!disc) return NextResponse.json({ error: 'کد تخفیف وجود ندارد' }, { status: 404 });
  if (!disc.isActive) return NextResponse.json({ error: 'این کد تخفیف غیرفعال است' }, { status: 400 });
  if (disc.expiresAt && new Date(disc.expiresAt) < new Date()) return NextResponse.json({ error: 'کد تخفیف منقضی شده' }, { status: 400 });
  if (disc.maxUses > 0 && disc.usedCount >= disc.maxUses) return NextResponse.json({ error: 'ظرفیت استفاده از این کد تمام شده' }, { status: 400 });
  if (Number(disc.minOrder) > 0 && total < Number(disc.minOrder)) {
    return NextResponse.json({ error: `حداقل سفارش برای این کد ${new Intl.NumberFormat('fa-IR').format(Number(disc.minOrder))} ریال است` }, { status: 400 });
  }

  const discount = disc.type === 'PERCENTAGE'
    ? Math.round(total * Number(disc.value) / 100)
    : Math.min(Number(disc.value), total);

  return NextResponse.json({ success: true, discount, code: disc.code, description: disc.description });
}
