import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// Helper function to get simplified IP address
const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return ip === '::1' ? '127.0.0.1' : ip;
};

// Helper function to get simplified User-Agent
const getUserAgent = (request: Request): string => {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  return userAgent.length > 255 ? userAgent.substring(0, 255) : userAgent;
};

// GET handler for checking admin authentication
export async function GET(request: Request) {
  let adminAuthCookie: string | undefined;
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    // Extract admin-auth cookie
    const cookies = request.headers.get('cookie') || '';
    const cookiePairs = cookies.split(';').map(cookie => cookie.trim());
    adminAuthCookie = cookiePairs
      .find(cookie => cookie.startsWith('admin-auth='))
      ?.split('=')[1];

    if (!adminAuthCookie) {
      console.log('🔍 Server: No admin-auth cookie found', { ipAddress, userAgent });
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

    // Verify admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.adminId,
        phoneNumber: decoded.phoneNumber,
        isActive: true,
      },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!admin) {
      console.warn('🚨 Server: No active admin found for ID:', decoded.adminId, { ipAddress, userAgent });
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است یا وجود ندارد. لطفاً دوباره وارد شوید' },
        { status: 401 }
      );
    }

    // Verify session exists and is valid
    const session = await prisma.adminSession.findFirst({
      where: {
        adminId: admin.id,
        tokenHash: adminAuthCookie,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      console.warn('🚨 Server: Invalid or expired session for admin ID:', admin.id, { ipAddress, userAgent });
      return NextResponse.json(
        { success: false, error: 'جلسه شما منقضی شده است. لطفاً دوباره وارد شوید' },
        { status: 401 }
      );
    }

    console.log('✅ Server: Admin verified:', `${admin.firstName} ${admin.lastName}`, { ipAddress, userAgent });
    return NextResponse.json({
      success: true,
      message: 'احراز هویت با موفقیت انجام شد',
      data: {
        id: admin.id,
        phoneNumber: admin.phoneNumber,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Server: Me API Error:', { error, adminAuthCookie, ipAddress, userAgent });

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'توکن احراز هویت نامعتبر است. لطفاً دوباره وارد شوید' },
        { status: 401 }
      );
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, error: 'توکن شما منقضی شده است. لطفاً دوباره وارد شوید' },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message.includes('Prisma')) {
      console.error('🚨 Server: Database error:', error, { ipAddress, userAgent });
      return NextResponse.json(
        { success: false, error: 'خطای پایگاه داده رخ داد. لطفاً بعداً تلاش کنید' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'خطای سرور رخ داد. لطفاً بعداً تلاش کنید' },
      { status: 500 }
    );
  }
}