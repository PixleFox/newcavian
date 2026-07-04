import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('user-auth')?.value;
  if (!token) return null;
  try { return (jwt.verify(token, JWT_SECRET) as any).userId; } catch { return null; }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, full_name: true, firstName: true, lastName: true, email: true, phone_number: true, main_address: true, city: true, postal_code: true, created_at: true, last_login: true },
  });

  if (!user) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { fullName, email, address, city, postalCode } = await req.json();

  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      full_name: fullName || undefined,
      email: email || undefined,
      main_address: address || undefined,
      city: city || undefined,
      postal_code: postalCode || undefined,
      updated_at: new Date(),
    },
    select: { id: true, full_name: true, email: true, phone_number: true, main_address: true, city: true, postal_code: true },
  });

  return NextResponse.json({ success: true, data: user });
}
