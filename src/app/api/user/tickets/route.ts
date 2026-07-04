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

  const tickets = await prisma.ticket.findMany({
    where: { userId },
    include: { TicketMessage: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: tickets });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subject, description, category, priority } = await req.json();
  if (!subject || !description) return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });

  const CATEGORY_MAP: Record<string, string> = {
    GENERAL: 'OTHER', ORDER: 'ORDER_ISSUE', PAYMENT: 'PAYMENT_PROBLEM',
    TECHNICAL: 'TECHNICAL_ISSUE', SHIPPING: 'SHIPPING_ISSUE',
  };
  const validCategories = ['ORDER_ISSUE','PAYMENT_PROBLEM','PRODUCT_QUESTION','SHIPPING_ISSUE','RETURN_REQUEST','ACCOUNT_ISSUE','TECHNICAL_ISSUE','OTHER'];
  const safeCategory = validCategories.includes(category) ? category : (CATEGORY_MAP[category] || 'OTHER');

  const ticket = await prisma.ticket.create({
    data: {
      id: randomUUID(),
      subject, description,
      category: safeCategory as any,
      priority: (priority || 'MEDIUM') as any,
      userId,
      updatedAt: new Date(),
      TicketMessage: {
        create: {
          id: randomUUID(),
          content: description,
          type: 'USER',
          userId,
        },
      },
    },
    include: { TicketMessage: true },
  });

  return NextResponse.json({ success: true, data: ticket }, { status: 201 });
}
