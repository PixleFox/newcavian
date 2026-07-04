import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

// Interface for request body
interface CreateAdminRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  role: 'OWNER' | 'MANAGER' | 'SELLER' | 'MARKETER' | 'OPERATOR';
}

// Interface for response data
interface CreateAdminResponse {
  success: boolean;
  data: {
    id: number;
    phoneNumber: string;
    email: string | null;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: Date;
  };
}

// Interface for JWT payload
interface AdminJwtPayload {
  adminId: number;
  phoneNumber: string;
  iat: number;
  exp: number;
}

// Schema validation for request body
const createAdminSchema = z.object({
  phoneNumber: z.string().min(1, 'شماره تلفن الزامی است').regex(/^\+?\d{10,15}$/, 'شماره تلفن نامعتبر است'),
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
  role: z.enum(['OWNER', 'MANAGER', 'SELLER', 'MARKETER', 'OPERATOR'], {
    errorMap: () => ({ message: 'نقش نامعتبر است' }),
  }),
});

// JWT secret with runtime validation
const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Utility function to sanitize string inputs
const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>{}]/g, '');
};

// POST handler for creating a new admin
export async function POST(request: Request) {
  let body: CreateAdminRequest | null = null;
  let adminAuthCookie: string | undefined;

  try {
    // Extract admin-auth cookie
    const cookies = request.headers.get('cookie') || '';
    const cookiePairs = cookies.split(';').map(cookie => cookie.trim());
    adminAuthCookie = cookiePairs
      .find(cookie => cookie.startsWith('admin-auth='))
      ?.split('=')[1];

    if (!adminAuthCookie) {
      console.log(
        JSON.stringify({
          level: 'info',
          message: 'No admin-auth cookie found',
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.json(
        { error: 'احراز هویت الزامی است' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(adminAuthCookie, JWT_SECRET) as unknown;
    if (!decoded || typeof decoded !== 'object') {
      throw new jwt.JsonWebTokenError('Invalid token structure');
    }

    // Validate JWT payload
    const payload = decoded as AdminJwtPayload;
    if (!payload.adminId || !payload.phoneNumber) {
      console.log(
        JSON.stringify({
          level: 'warn',
          message: 'Invalid JWT payload structure',
          payload,
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.json(
        { error: 'ساختار توکن نامعتبر است' },
        { status: 401 }
      );
    }

    // Verify admin exists, is active, and has sufficient privileges
    const currentAdmin = await prisma.admin.findUnique({
      where: {
        id: payload.adminId,
        phoneNumber: payload.phoneNumber,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentAdmin) {
      console.log(
        JSON.stringify({
          level: 'warn',
          message: 'No active admin found',
          adminId: payload.adminId,
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.json(
        { error: 'کاربر معتبر نیست' },
        { status: 401 }
      );
    }

    // Enforce role hierarchy: Only OWNER or MANAGER can create admins
    if (!['OWNER', 'MANAGER'].includes(currentAdmin.role)) {
      console.log(
        JSON.stringify({
          level: 'warn',
          message: 'Unauthorized admin role',
          adminId: currentAdmin.id,
          role: currentAdmin.role,
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.json(
        { error: 'شما مجاز به ایجاد ادمین نیستید' },
        { status: 403 }
      );
    }

    // Verify session is valid
    const session = await prisma.adminSession.findFirst({
      where: {
        adminId: currentAdmin.id,
        tokenHash: adminAuthCookie,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      console.log(
        JSON.stringify({
          level: 'warn',
          message: 'Invalid or expired session',
          adminId: currentAdmin.id,
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.json(
        { error: 'جلسه نامعتبر یا منقضی شده است' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    body = await request.json();
    const validatedData = createAdminSchema.parse(body);

    // Sanitize inputs
    const sanitizedData = {
      ...validatedData,
      firstName: sanitizeString(validatedData.firstName),
      lastName: sanitizeString(validatedData.lastName),
      email: validatedData.email ? sanitizeString(validatedData.email) : undefined,
    };

    // Normalize phone number
    const normalizedPhoneNumber = sanitizedData.phoneNumber.startsWith('+98')
      ? sanitizedData.phoneNumber
      : `+98${sanitizedData.phoneNumber.replace(/^0/, '')}`;

    console.log(
      JSON.stringify({
        level: 'info',
        message: 'Attempting to create admin',
        data: {
          phoneNumber: normalizedPhoneNumber,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          email: sanitizedData.email,
          role: sanitizedData.role,
        },
        timestamp: new Date().toISOString(),
      })
    );

    // Check for existing admin
    const orConditions: { phoneNumber?: string; email?: string }[] = [
      { phoneNumber: normalizedPhoneNumber },
    ];
    if (sanitizedData.email) {
      orConditions.push({ email: sanitizedData.email });
    }

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: orConditions,
      },
      select: {
        phoneNumber: true,
        email: true,
      },
    });

    if (existingAdmin) {
      console.log(
        JSON.stringify({
          level: 'warn',
          message: 'Duplicate admin found',
          data: {
            phoneNumber: existingAdmin.phoneNumber,
            email: existingAdmin.email,
          },
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.json(
        {
          error: existingAdmin.phoneNumber === normalizedPhoneNumber ? 'شماره تلفن تکراری است' : 'ایمیل تکراری است',
          field: existingAdmin.phoneNumber === normalizedPhoneNumber ? 'phoneNumber' : 'email',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(sanitizedData.password, 10);

    // Create new admin within a transaction
    const newAdmin = await prisma.$transaction(async (tx) => {
      const admin = await tx.admin.create({
        data: {
          phoneNumber: normalizedPhoneNumber,
          email: sanitizedData.email || null,
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          passwordHash,
          role: sanitizedData.role,
          isActive: true,
          creatorId: currentAdmin.id,
        },
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      return admin;
    });

    console.log(
      JSON.stringify({
        level: 'info',
        message: 'Admin created successfully',
        data: {
          id: newAdmin.id,
          phoneNumber: newAdmin.phoneNumber,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
        },
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json<CreateAdminResponse>(
      {
        success: true,
        data: {
          id: newAdmin.id,
          phoneNumber: newAdmin.phoneNumber,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          role: newAdmin.role,
          createdAt: newAdmin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        level: 'error',
        message: 'Create Admin API Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        body: body || 'Body not parsed yet',
        adminAuthCookie: adminAuthCookie || 'Not provided',
        timestamp: new Date().toISOString(),
      })
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'خطای اعتبارسنجی',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: `توکن نامعتبر است: ${error.message}` },
        { status: 401 }
      );
    }

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'توکن منقضی شده است' },
        { status: 401 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      const field = target.includes('email') ? 'email' : target.includes('phoneNumber') ? 'phoneNumber' : 'unknown';
      return NextResponse.json(
        {
          error: field === 'email' ? 'ایمیل تکراری است' : field === 'phoneNumber' ? 'شماره تلفن تکراری است' : 'خطای پایگاه داده',
          field,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'خطای سرور',
        details: error instanceof Error ? error.message : 'خطای ناشناخته رخ داد',
      },
      { status: 500 }
    );
  }
}