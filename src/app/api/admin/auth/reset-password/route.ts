import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { verifyOtp } from '@/lib/otp';
import * as bcrypt from 'bcrypt';

// Constants
const MAX_BODY_SIZE = 1024 * 10; // 10KB max body size
const MAX_PHONE_LENGTH = 15; // Max digits for phone number
const MAX_PASSWORD_LENGTH = 100; // Max chars for password
const SALT_ROUNDS = 10;

// Schema validation for request body
const resetPasswordSchema = z.object({
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
  otp: z
    .string({ required_error: 'کد تایید الزامی است' })
    .min(1, 'کد تایید نمی‌تواند خالی باشد')
    .refine((val) => /^\d+$/.test(val), 'کد تایید باید فقط شامل اعداد باشد'),
  newPassword: z
    .string({ required_error: 'رمز عبور جدید الزامی است' })
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .max(MAX_PASSWORD_LENGTH, `رمز عبور نمی‌تواند بیش از ${MAX_PASSWORD_LENGTH} کاراکتر باشد`)
    .refine((val) => val.trim() === val, 'رمز عبور نمی‌تواند با فاصله شروع یا پایان یابد'),
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
    const parsedBody = resetPasswordSchema.safeParse(body);
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

    const { phoneNumber, otp, newPassword } = parsedBody.data;
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    console.log('🔍 Server: Reset password attempt with', {
      phoneNumber: normalizedPhoneNumber,
    });

    // Verify OTP
    const isValidOtp = verifyOtp(normalizedPhoneNumber, otp);
    if (!isValidOtp) {
      console.warn('🚨 Server: Invalid OTP for phone number:', normalizedPhoneNumber);
      return NextResponse.json(
        { error: 'کد تایید نامعتبر یا منقضی شده است' },
        { status: 400 }
      );
    }

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

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update admin's password
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    console.log('✅ Server: Password reset successful for admin:', `${admin.firstName} ${admin.lastName}`);

    return NextResponse.json(
      {
        success: true,
        message: 'رمز عبور با موفقیت تغییر یافت',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('❌ Server: Reset Password API Error:', {
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
