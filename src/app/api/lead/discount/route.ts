import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست' }, { status: 400 });
    }

    // Check if already registered — return existing code
    const existingLead = await prisma.lead.findUnique({ where: { phone } });
    if (existingLead) {
      return NextResponse.json({ code: existingLead.code });
    }

    // Generate unique discount code
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const code = `LEAD-${suffix}`;

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    // Save lead + discount in a transaction
    await prisma.$transaction([
      prisma.lead.create({ data: { phone, code, source: 'homepage' } }),
      prisma.discount.create({
        data: {
          code,
          description: `کد تخفیف عضویت — ${phone}`,
          type: 'PERCENTAGE',
          value: 15,
          minOrder: 0,
          maxUses: 1,
          isActive: true,
          expiresAt: expires,
        },
      }),
    ]);

    return NextResponse.json({ code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
