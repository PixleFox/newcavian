import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { UAParser } from 'ua-parser-js';

// JWT secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get and normalize IP address
const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ipFromHeaders = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : realIp || cfConnectingIp;

  if (!ipFromHeaders || ipFromHeaders === '::1') {
    return '127.0.0.1'; // Fallback for local/Postman requests
  }

  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv4Regex.test(ipFromHeaders) || ipv6Regex.test(ipFromHeaders)) {
    return ipFromHeaders;
  }

  console.warn('🚨 Server: Invalid IP detected:', ipFromHeaders);
  return '127.0.0.1'; // Fallback to localhost if invalid
};

// Helper function to get simplified browser name and version
const getBrowserOnlyUserAgent = (rawUserAgent: string | null): string => {
  if (!rawUserAgent) {
    return 'Unknown';
  }

  // Check for Postman requests
  if (rawUserAgent.toLowerCase().includes('postman')) {
    return 'Postman';
  }

  const parser = new UAParser(rawUserAgent);
  const result = parser.getResult();

  const browser = result.browser.name || 'Unknown';
  const browserVersion = result.browser.version?.split('.')[0] || '';
  const simplified = `${browser}${browserVersion ? ` ${browserVersion}` : ''}`;

  if (simplified.length > 255) {
    console.warn('🚨 Server: Browser User-Agent too long, truncating:', simplified);
    return simplified.substring(0, 255);
  }

  return simplified;
};

// POST handler for admin logout
export async function POST(request: NextRequest) {
  let adminAuthCookie: string | undefined;

  try {
    // Extract admin-auth cookie
    const cookies = request.headers.get('cookie') || '';
    const cookiePairs = cookies.split(';').map(cookie => cookie.trim());
    adminAuthCookie = cookiePairs
      .find(cookie => cookie.startsWith('admin-auth='))
      ?.split('=')[1];

    if (!adminAuthCookie) {
      console.log('🔍 Server: No admin-auth cookie found for logout');
      return NextResponse.json(
        { error: 'هیچ توکن احراز هویتی یافت نشد' },
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

    // Find admin to update lastLogoutAt
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      console.warn('🚨 Server: No admin found for ID:', decoded.adminId);
      return NextResponse.json(
        { error: 'ادمین یافت نشد' },
        { status: 401 }
      );
    }

    // Update lastLogoutAt
    await prisma.admin.update({
      where: { id: decoded.adminId },
      data: { lastLogoutAt: new Date() },
    });

    // Get client IP and User-Agent for logging
    const ipAddress = getClientIp(request);
    const rawUserAgent = request.headers.get('user-agent');
    const userAgent = getBrowserOnlyUserAgent(rawUserAgent);
    console.log('🔍 Server: Logout attempt from IP:', ipAddress, 'User-Agent:', userAgent);

    // Find and invalidate session
    const session = await prisma.adminSession.findFirst({
      where: {
        adminId: decoded.adminId,
        tokenHash: adminAuthCookie,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (session) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: {
          isValid: false,
          expiresAt: new Date(), // Immediately expire
        },
      });
      console.log('✅ Server: Session invalidated for admin ID:', decoded.adminId, 'from IP:', ipAddress, 'User-Agent:', userAgent);
    } else {
      console.warn('🚨 Server: No valid session found for token:', adminAuthCookie);
    }

    // Clear admin-auth cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    };

    const logoutCookie = serialize('admin-auth', '', cookieOptions);

    return NextResponse.json(
      { success: true, message: 'با موفقیت خارج شدید' },
      {
        status: 200,
        headers: {
          'Set-Cookie': logoutCookie,
        },
      }
    );
  } catch (error: unknown) {
    const ipAddress = getClientIp(request);
    const userAgent = getBrowserOnlyUserAgent(request.headers.get('user-agent'));
    console.error('❌ Server: Logout API Error:', { error, adminAuthCookie, ipAddress, userAgent });
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'توکن منقضی شده است' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        error: 'خطای خروج',
        details: error instanceof Error ? error.message : 'خطای ناشناخته',
      },
      { status: 500 }
    );
  }
}