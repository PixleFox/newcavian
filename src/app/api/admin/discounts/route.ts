import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth-middleware';
import { randomUUID } from 'crypto';

// GET /api/admin/discounts
export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: discounts });
}

// POST /api/admin/discounts
export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const { code, description, type, value, minOrder, maxUses, isActive, expiresAt } = body;

  if (!code || !value) {
    return NextResponse.json({ error: 'کد و مقدار تخفیف الزامی است' }, { status: 400 });
  }

  const exists = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
  if (exists) return NextResponse.json({ error: 'این کد تخفیف قبلاً ثبت شده' }, { status: 409 });

  const discount = await prisma.discount.create({
    data: {
      id: randomUUID(),
      code: code.toUpperCase(),
      description: description || null,
      type: type || 'PERCENTAGE',
      value: parseFloat(value),
      minOrder: parseFloat(minOrder || '0'),
      maxUses: parseInt(maxUses || '0'),
      isActive: isActive !== false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({ success: true, data: discount }, { status: 201 });
}

// PATCH /api/admin/discounts?id=xxx
export async function PATCH(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id الزامی است' }, { status: 400 });

  const body = await req.json();
  const { code, description, type, value, minOrder, maxUses, isActive, expiresAt } = body;

  const data: any = {};
  if (code !== undefined)        data.code        = code.toUpperCase();
  if (description !== undefined) data.description = description;
  if (type !== undefined)        data.type        = type;
  if (value !== undefined)       data.value       = parseFloat(value);
  if (minOrder !== undefined)    data.minOrder    = parseFloat(minOrder);
  if (maxUses !== undefined)     data.maxUses     = parseInt(maxUses);
  if (isActive !== undefined)    data.isActive    = isActive;
  if (expiresAt !== undefined)   data.expiresAt   = expiresAt ? new Date(expiresAt) : null;

  const discount = await prisma.discount.update({ where: { id }, data });
  return NextResponse.json({ success: true, data: discount });
}

// DELETE /api/admin/discounts?id=xxx
export async function DELETE(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id الزامی است' }, { status: 400 });

  await prisma.discount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
