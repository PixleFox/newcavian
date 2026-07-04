import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('user-auth='))?.split('=')[1];

    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ authenticated: false, error: 'توکن نامعتبر' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: payload.userId },
      select: { id: true, full_name: true, firstName: true, lastName: true, phone_number: true, email: true, role: true, status: true },
    });

    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });

    const name = user.full_name || [user.firstName, user.lastName].filter(Boolean).join(' ') || null;

    return NextResponse.json({
      authenticated: true,
      data: { id: user.id, fullName: name, phone: user.phone_number, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('/api/user/auth/me error:', err);
    return NextResponse.json({ authenticated: false, error: 'خطای سرور' }, { status: 500 });
  }
}
