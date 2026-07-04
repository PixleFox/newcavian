import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// JWT secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// Helper function to get client IP
const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return ip === '::1' ? '127.0.0.1' : ip;
};

// GET handler for fetching complete admin profile data
export async function GET(request: Request) {
  const ipAddress = getClientIp(request);
  
  try {
    // Extract admin-auth cookie
    const cookies = request.headers.get('cookie') || '';
    const cookiePairs = cookies.split(';').map(cookie => cookie.trim());
    const adminAuthCookie = cookiePairs
      .find(cookie => cookie.startsWith('admin-auth='))
      ?.split('=')[1];

    if (!adminAuthCookie) {
      console.log('🔍 Server: No admin-auth cookie found', { ipAddress });
      return NextResponse.json(
        { success: false, error: 'لطفاً ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(adminAuthCookie, JWT_SECRET) as {
      adminId: number;
      phoneNumber: string;
      iat: number;
      exp: number;
    };

    // Fetch complete admin data directly from database
    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.adminId,
        isActive: true,
      },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      console.warn('🚨 Server: No active admin found for ID:', decoded.adminId, { ipAddress });
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است یا وجود ندارد' },
        { status: 401 }
      );
    }

    console.log('✅ Server: Admin profile data fetched successfully', { adminId: admin.id, email: admin.email });
    return NextResponse.json({
      success: true,
      message: 'اطلاعات پروفایل با موفقیت دریافت شد',
      data: admin,
    });
  } catch (error: unknown) {
    console.error('❌ Server: Profile API Error:', { error, ipAddress });

    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, error: 'توکن احراز هویت نامعتبر است. لطفاً دوباره وارد شوید' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'خطای سرور رخ داد. لطفاً بعداً تلاش کنید' },
      { status: 500 }
    );
  }
}
