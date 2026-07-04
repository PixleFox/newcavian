import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { serialize } from 'cookie';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;
const MAX_BODY_SIZE = 1024 * 10; // 10KB max body size
const MAX_PHONE_LENGTH = 15; // Max digits for phone number
const MAX_PASSWORD_LENGTH = 100; // Max chars for password

// Schema validation for request body
const loginSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'شماره تلفن الزامی است' })
    .min(1, 'شماره تلفن نمی‌تواند خالی باشد')
    .max(MAX_PHONE_LENGTH, `شماره تلفن نمی‌تواند بیش از ${MAX_PHONE_LENGTH} رقم باشد`)
    .regex(/^\+?\d{10,15}$/, 'شماره تلفن نامعتبر است')
    .refine(
      (val) => !/[\;\--]/.test(val),
      'ورودی حاوی کاراکترهای غیرمجاز است'
    )
    .refine((val) => val.trim() === val, 'شماره تلفن نمی‌تواند شامل فاصله باشد'),
  password: z
    .string({ required_error: 'رمز عبور الزامی است' })
    .min(1, 'رمز عبور نمی‌تواند خالی باشد')
    .max(MAX_PASSWORD_LENGTH, `رمز عبور نمی‌تواند بیش از ${MAX_PASSWORD_LENGTH} کاراکتر باشد`)
    .refine((val) => val.trim() === val, 'رمز عبور نمی‌تواند شامل فاصله باشد'),
});

// Normalize phone number to +98 format
const normalizePhoneNumber = (phone: string): string => {
  let normalized = phone.replace(/[^\d+]/g, ''); // Remove non-digits and +
  if (!normalized.startsWith('+98') && normalized.length >= 10) {
    normalized = '+98' + normalized.replace(/^0/, '');
  }
  return normalized;
};

// Helper function to get and normalize IP address
const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ipFromHeaders = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : realIp || cfConnectingIp || 'unknown';

  if (ipFromHeaders === '::1') {
    return '127.0.0.1';
  }

  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv4Regex.test(ipFromHeaders) || ipv6Regex.test(ipFromHeaders) || ipFromHeaders === 'unknown') {
    return ipFromHeaders;
  }

  console.warn('🚨 Server: Invalid IP detected:', ipFromHeaders);
  return 'unknown';
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

// POST handler for admin login
export async function POST(request: NextRequest) {
  let body: any = null;
  try {
    // Check Content-Length for oversized payloads
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BODY_SIZE) {
      console.warn('🚨 Server: Request body too large:', { contentLength });
      return NextResponse.json(
        { error: 'بدنه درخواست بیش از حد بزرگ است' },
        { status: 413 }
      );
    }

    // Parse JSON body
    body = await request.json();
    const parsedBody = loginSchema.safeParse(body);
    if (!parsedBody.success) {
      console.warn('🚨 Server: Validation failed:', parsedBody.error.errors);
      return NextResponse.json(
        {
          error: 'خطای اعتبارسنجی',
          details: parsedBody.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { phoneNumber, password } = parsedBody.data;
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    console.log('🔍 Server: Login attempt with', {
      phoneNumber,
      normalizedPhoneNumber,
      headers: Object.fromEntries(request.headers),
    });

    // Find admin by phoneNumber
    const admin = await prisma.admin.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        isActive: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    // Check if admin exists and is active
    if (!admin) {
      console.warn('🚨 Server: No admin found with phoneNumber:', normalizedPhoneNumber);
      return NextResponse.json(
        { error: 'ادمین با این شماره تلفن یافت نشد' },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      console.warn('🚨 Server: Admin is inactive:', normalizedPhoneNumber);
      return NextResponse.json(
        { error: 'حساب ادمین غیرفعال است' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.lockedUntil && new Date() < admin.lockedUntil) {
      const remainingMinutes = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      console.warn('🚨 Server: Account locked:', { normalizedPhoneNumber, remainingMinutes });
      return NextResponse.json(
        {
          error: `حساب به دلیل ${MAX_FAILED_ATTEMPTS} تلاش ناموفق قفل شده است. لطفاً ${remainingMinutes} دقیقه دیگر تلاش کنید.`,
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      const newFailedAttempts = admin.failedLoginAttempts + 1;
      const lockData = newFailedAttempts >= MAX_FAILED_ATTEMPTS
        ? { lockedUntil: new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000) }
        : {};

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          ...lockData,
        },
      });

      const errorMessage = newFailedAttempts >= MAX_FAILED_ATTEMPTS
        ? `حساب به دلیل ${MAX_FAILED_ATTEMPTS} تلاش ناموفق قفل شد. لطفاً ${LOCK_DURATION_MINUTES} دقیقه دیگر تلاش کنید.`
        : 'رمز عبور نامعتبر است';

      console.warn('🚨 Server: Invalid password:', {
        normalizedPhoneNumber,
        failedAttempts: newFailedAttempts,
        locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS,
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }

    // Reset failed login attempts and update lastLoginAt
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, phoneNumber: admin.phoneNumber },
      JWT_SECRET,
      { expiresIn: SESSION_MAX_AGE }
    );

    // Get client IP and User-Agent
    const ipAddress = getClientIp(request);
    const rawUserAgent = request.headers.get('user-agent');
    const userAgent = getBrowserOnlyUserAgent(rawUserAgent);
    console.log('🔍 Server: Client details:', { ipAddress, userAgent });

    // Create session
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash: token,
        ipAddress,
        userAgent,
        expiresAt,
        isValid: true,
      },
    });

    console.log('✅ Server: Admin authenticated:', `${admin.firstName} ${admin.lastName}`);

    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: SESSION_MAX_AGE,
    };

    const authCookie = serialize('admin-auth', token, cookieOptions);

    return NextResponse.json(
      {
        success: true,
        data: {
          fullName: `${admin.firstName} ${admin.lastName}`,
        },
      },
      {
        status: 200,
        headers: { 'Set-Cookie': authCookie },
      }
    );
  } catch (error: unknown) {
    console.error('❌ Server: Login API Error:', {
      error,
      body,
      headers: Object.fromEntries(request.headers),
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'خطای اعتبارسنجی',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      console.warn('🚨 Server: Invalid JSON body:', body);
      return NextResponse.json(
        { error: 'بدنه درخواست JSON نامعتبر است' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('prisma')) {
      console.error('🚨 Server: Database error:', error);
      return NextResponse.json(
        { error: 'خطای پایگاه داده رخ داد' },
        { status: 500 }
      );
    }

    console.error('🚨 Server: Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'خطای سرور',
        details: error instanceof Error ? error.message : 'خطای ناشناخته رخ داد',
      },
      { status: 500 }
    );
  }
}