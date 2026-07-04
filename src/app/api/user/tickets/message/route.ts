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

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ticketId, content } = await req.json();
  if (!ticketId || !content) return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });

  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, userId } });
  if (!ticket) return NextResponse.json({ error: 'تیکت یافت نشد' }, { status: 404 });

  const msg = await prisma.ticketMessage.create({
    data: { id: randomUUID(), ticketId, content, type: 'USER', userId },
  });

  await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'OPEN', updatedAt: new Date() } });

  return NextResponse.json({ success: true, data: msg });
}
