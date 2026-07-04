import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// TEST MODE: login with phone number only (no OTP required)
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'شماره موبایل معتبر نیست' }, { status: 400 });
    }

    // find or create user
    let user = await prisma.users.findUnique({ where: { phone_number: phone } });

    if (!user) {
      user = await prisma.users.create({
        data: {
          phone_number: phone,
          passwordHash: 'test-mode-no-password',
          status: 'ACTIVE',
          phone_verified: true,
          updated_at: new Date(),
        },
      });
    }

    // update last_login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const token = jwt.sign(
      { userId: user.id, phone: user.phone_number, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, fullName: user.full_name, phone: user.phone_number },
    });

    response.cookies.set('user-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
