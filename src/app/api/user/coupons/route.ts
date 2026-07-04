import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const coupons = await prisma.discount.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      select: { id: true, code: true, description: true, type: true, value: true, minOrder: true, maxUses: true, usedCount: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const available = coupons.filter(c => c.maxUses === 0 || c.usedCount < c.maxUses);
    return NextResponse.json({ success: true, data: available });
  } catch (error) {
    console.error('coupons error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}
