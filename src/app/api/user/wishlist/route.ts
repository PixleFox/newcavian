import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('user-auth')?.value;
  if (!token) return null;
  try { return (jwt.verify(token, JWT_SECRET) as any).userId; } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.wishlist.findMany({
    where: { userId },
    include: { Product: { select: { id: true, name: true, price: true, compareAtPrice: true, mainImage: true, totalStock: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId الزامی است' }, { status: 400 });

  const exists = await prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId } } });
  if (exists) {
    await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
    return NextResponse.json({ success: true, liked: false });
  }

  await prisma.wishlist.create({
    data: { id: randomUUID(), userId, productId, updatedAt: new Date() },
  });
  return NextResponse.json({ success: true, liked: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId الزامی است' }, { status: 400 });

  await prisma.wishlist.deleteMany({ where: { userId, productId } });
  return NextResponse.json({ success: true });
}
