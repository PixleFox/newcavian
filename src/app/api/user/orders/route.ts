import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('user-auth')?.value;
  if (!token) return null;
  try {
    const p = jwt.verify(token, JWT_SECRET) as any;
    return p.userId || null;
  } catch { return null; }
}

// GET /api/user/orders
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      OrderItem: {
        include: { Product: { select: { name: true, mainImage: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: orders });
}
