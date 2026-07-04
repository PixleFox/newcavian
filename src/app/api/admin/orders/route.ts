import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth-middleware';
import { randomUUID } from 'crypto';

// GET /api/admin/orders?page=1&limit=20&status=&search=
export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get('page') || '1');
  const limit  = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { users: { full_name: { contains: search, mode: 'insensitive' } } },
      { users: { phone_number: { contains: search } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        users: { select: { id: true, full_name: true, phone_number: true, email: true } },
        OrderItem: {
          include: { Product: { select: { name: true, mainImage: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: orders, total, page, pages: Math.ceil(total / limit) });
}

// PATCH /api/admin/orders?id=xxx  body: { status, comment? }
export async function PATCH(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id الزامی است' }, { status: 400 });

  const { status, comment } = await req.json();
  if (!status) return NextResponse.json({ error: 'status الزامی است' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
      OrderHistory: {
        create: {
          id: randomUUID(),
          status,
          comment: comment || null,
        },
      },
    },
    include: {
      users: { select: { id: true, full_name: true, phone_number: true } },
      OrderItem: { include: { Product: { select: { name: true, mainImage: true } } } },
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
