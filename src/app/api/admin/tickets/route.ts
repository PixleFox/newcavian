import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth-middleware';

// GET /api/admin/tickets?page=1&status=&search=
export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get('page') || '1');
  const limit  = 20;
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { subject: { contains: search, mode: 'insensitive' } },
    { users: { phone_number: { contains: search } } },
    { users: { full_name: { contains: search, mode: 'insensitive' } } },
  ];

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        users: { select: { id: true, full_name: true, phone_number: true } },
        TicketMessage: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: tickets, total });
}

// PATCH /api/admin/tickets?id=xxx  body: { status }
export async function PATCH(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id الزامی است' }, { status: 400 });

  const { status } = await req.json();

  const updated = await prisma.ticket.update({
    where: { id },
    data: { status, updatedAt: new Date() },
    include: { users: { select: { full_name: true, phone_number: true } } },
  });

  return NextResponse.json({ success: true, data: updated });
}

// POST /api/admin/tickets/reply  — ارسال پیام ادمین
export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { ticketId, content } = await req.json();
  if (!ticketId || !content) return NextResponse.json({ error: 'داده ناقص است' }, { status: 400 });

  const { randomUUID } = await import('crypto');

  const msg = await prisma.ticketMessage.create({
    data: {
      id: randomUUID(),
      ticketId,
      adminId: auth.admin.id,
      content,
      type: 'ADMIN',
    },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'IN_PROGRESS', updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, data: msg });
}
