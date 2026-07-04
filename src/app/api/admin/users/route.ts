import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page   = parseInt(searchParams.get('page')  || '1');
  const limit  = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const skip   = (page - 1) * limit;

  const where: any = { deleted_at: null };
  if (search) {
    where.OR = [
      { full_name:     { contains: search, mode: 'insensitive' } },
      { phone_number:  { contains: search, mode: 'insensitive' } },
      { email:         { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;

  try {
    const [total, users] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where, skip, take: limit,
        select: {
          id: true, full_name: true, firstName: true, lastName: true,
          email: true, phone_number: true, role: true, status: true,
          level: true, email_verified: true, phone_verified: true,
          last_login: true, created_at: true, main_address: true,
          city: true, referral_code: true,
          _count: { select: { Order: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id الزامی' }, { status: 400 });

  try {
    const data = await request.json();
    const user = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        full_name:    data.full_name    ?? undefined,
        email:        data.email        ?? undefined,
        phone_number: data.phone_number ?? undefined,
        role:         data.role         ?? undefined,
        status:       data.status       ?? undefined,
        level:        data.level        != null ? parseInt(data.level) : undefined,
        main_address: data.main_address ?? undefined,
        city:         data.city         ?? undefined,
      },
      select: { id: true, full_name: true, email: true, phone_number: true, role: true, status: true, level: true },
    });
    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ success: false, error: 'اطلاعات تکراری' }, { status: 400 });
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id الزامی' }, { status: 400 });

  try {
    // soft delete
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
