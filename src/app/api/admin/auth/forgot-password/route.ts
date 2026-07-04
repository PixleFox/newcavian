import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { generateOtp, sendOtp, storeOtp } from '@/lib/otp';

// Constants
const MAX_BODY_SIZE = 1024 * 10; // 10KB max body size
const MAX_PHONE_LENGTH = 15; // Max digits for phone number

// Schema validation for request body
const forgotPasswordSchema = z.object({
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
});

// Normalize phone number to +98 format
const normalizePhoneNumber = (phone: string): string => {
  let normalized = phone.replace(/[^\d+]/g, ''); // Remove non-digits and +
  if (!normalized.startsWith('+98') && normalized.length >= 10) {
    normalized = '+98' + normalized.replace(/^0/, '');
  }
  return normalized;
};

export async function POST(request: Request) {
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
    const parsedBody = forgotPasswordSchema.safeParse(body);
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

    const { phoneNumber } = parsedBody.data;
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    console.log('🔍 Server: Forgot password attempt with', {
      phoneNumber,
      normalizedPhoneNumber,
    });

    // Find admin by phoneNumber
    const admin = await prisma.admin.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    // Check if admin exists and is active
    if (!admin) {
      console.warn('🚨 Server: No admin found with phoneNumber:', normalizedPhoneNumber);
      return NextResponse.json(
        { error: 'ادمین با این شماره تلفن یافت نشد' },
        { status: 404 }
      );
    }

    if (!admin.isActive) {
      console.warn('🚨 Server: Admin is inactive:', normalizedPhoneNumber);
      return NextResponse.json(
        { error: 'حساب ادمین غیرفعال است' },
        { status: 403 }
      );
    }

    // Generate and send OTP
    const otp = generateOtp();
    await sendOtp(normalizedPhoneNumber, otp);
    storeOtp(normalizedPhoneNumber, otp);

    console.log('✅ Server: OTP sent to admin:', `${admin.firstName} ${admin.lastName}`);

    return NextResponse.json(
      {
        success: true,
        message: 'کد تایید با موفقیت ارسال شد',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('❌ Server: Forgot Password API Error:', {
      error,
      body,
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
