import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

// Schema validation for PUT requests
const adminSchema = z.object({
  phoneNumber: z.string().min(1, 'شماره تلفن الزامی است').regex(/^\+?\d{10,15}$/, 'شماره تلفن نامعتبر است'),
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  email: z.string().email('ایمیل نامعتبر است').optional().or(z.literal('')),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد').optional(),
  role: z.enum(['OWNER', 'MANAGER', 'SELLER', 'MARKETER', 'OPERATOR'], {
    errorMap: () => ({ message: 'نقش نامعتبر است' }),
  }),
});

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

// Helper function to authenticate admin
async function authenticateAdmin(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  let adminAuthCookie: string | undefined;

  try {
    // Extract admin-auth cookie
    const cookies = request.headers.get('cookie') || '';
    const cookiePairs = cookies.split(';').map(cookie => cookie.trim());
    adminAuthCookie = cookiePairs
      .find(cookie => cookie.startsWith('admin-auth='))
      ?.split('=')[1];

    if (!adminAuthCookie) {
      console.log('🔍 Server: No admin-auth cookie found', { ipAddress, userAgent });
      return { error: NextResponse.json({ success: false, error: 'لطفاً ابتدا وارد حساب کاربری خود شوید' }, { status: 401 }) };
    }

    // Verify JWT token
    const decoded = jwt.verify(adminAuthCookie, JWT_SECRET) as {
      adminId: number;
      phoneNumber: string;
      iat: number;
      exp: number;
    };

    // Verify admin exists, is active, and has sufficient privileges
    const currentAdmin = await prisma.admin.findUnique({
      where: {
        id: decoded.adminId,
        phoneNumber: decoded.phoneNumber,
        isActive: true,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentAdmin) {
      console.warn('🚨 Server: No active admin found for ID:', decoded.adminId, { ipAddress, userAgent });
      return { error: NextResponse.json({ success: false, error: 'حساب کاربری غیرفعال است یا وجود ندارد' }, { status: 401 }) };
    }

    // Verify session is valid
    const session = await prisma.adminSession.findFirst({
      where: {
        adminId: currentAdmin.id,
        tokenHash: adminAuthCookie,
        isValid: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      console.warn('🚨 Server: Invalid or expired session for admin ID:', currentAdmin.id, { ipAddress, userAgent });
      return { error: NextResponse.json({ success: false, error: 'جلسه شما منقضی شده است. لطفاً دوباره وارد شوید' }, { status: 401 }) };
    }

    return { admin: currentAdmin };
  } catch (error) {
    console.error('❌ Server: Authentication Error:', { error, adminAuthCookie, ipAddress, userAgent });
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: NextResponse.json({ success: false, error: 'توکن احراز هویت نامعتبر است' }, { status: 401 }) };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { error: NextResponse.json({ success: false, error: 'توکن شما منقضی شده است' }, { status: 401 }) };
    }
    return { error: NextResponse.json({ success: false, error: 'خطای سرور در احراز هویت' }, { status: 500 }) };
  }
}

// GET: Retrieve all admins
export async function GET(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (authResult.error) return authResult.error;

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('✅ Server: Retrieved admins', { count: admins.length, ipAddress, userAgent });
    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error) {
    console.error('❌ Server: GET /api/admin Error:', { error, ipAddress, userAgent });
    return NextResponse.json(
      { success: false, error: 'خطای سرور در دریافت ادمین‌ها' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing admin
export async function PUT(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const authResult = await authenticateAdmin(request);
    if (authResult.error) return authResult.error;
    if (!['OWNER', 'MANAGER'].includes(authResult.admin!.role)) {
      return NextResponse.json({ success: false, error: 'دسترسی کافی ندارید' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      console.warn('🚨 Server: Missing admin ID', { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'شناسه ادمین الزامی است' }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingAdmin) {
      console.warn('🚨 Server: Admin not found for ID:', id, { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'ادمین یافت نشد' }, { status: 404 });
    }

    const body = await request.json();
    const { phoneNumber, firstName, lastName, email, password, role } = adminSchema.parse(body);

    // Normalize phone number
    const normalizedPhoneNumber = phoneNumber.startsWith('+98') ? phoneNumber : `+98${phoneNumber.replace(/^0/, '')}`;

    // Check for conflicts
    const duplicateAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { phoneNumber: normalizedPhoneNumber },
          ...(email ? [{ email }] : []),
        ],
        NOT: { id: parseInt(id) },
      },
    });

    if (duplicateAdmin) {
      console.warn('🚨 Server: Duplicate admin found:', {
        phoneNumber: duplicateAdmin.phoneNumber,
        email: duplicateAdmin.email,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        {
          success: false,
          error: duplicateAdmin.phoneNumber === normalizedPhoneNumber ? 'شماره تلفن تکراری است' : 'ایمیل تکراری است',
          field: duplicateAdmin.phoneNumber === normalizedPhoneNumber ? 'phoneNumber' : 'email',
        },
        { status: 409 }
      );
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: {
        phoneNumber: normalizedPhoneNumber,
        email: email || null,
        firstName,
        lastName,
        passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
        role,
      },
    });

    console.log('✅ Server: Admin updated:', { id: updatedAdmin.id, ipAddress, userAgent });
    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedAdmin.id,
          phoneNumber: updatedAdmin.phoneNumber,
          email: updatedAdmin.email,
          firstName: updatedAdmin.firstName,
          lastName: updatedAdmin.lastName,
          role: updatedAdmin.role,
          updatedAt: updatedAdmin.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Server: PUT /api/admin Error:', { error, ipAddress, userAgent });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'خطای اعتبارسنجی', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'خطای سرور در به‌روزرسانی ادمین' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle admin status
export async function PATCH(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const authResult = await authenticateAdmin(request);
    if (authResult.error) return authResult.error;
    if (!['OWNER', 'MANAGER'].includes(authResult.admin!.role)) {
      return NextResponse.json({ success: false, error: 'دسترسی کافی ندارید' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      console.warn('🚨 Server: Missing admin ID', { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'شناسه ادمین الزامی است' }, { status: 400 });
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      console.warn('🚨 Server: Invalid isActive value:', isActive, { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'مقدار وضعیت نامعتبر است' }, { status: 400 });
    }

    // Check if admin exists
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, role: true, isActive: true },
    });

    if (!targetAdmin) {
      console.warn('🚨 Server: Admin not found for ID:', id, { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'ادمین یافت نشد' }, { status: 404 });
    }

    // Update admin status
    const updatedAdmin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: { isActive },
    });

    // Log the status change
    console.log('✅ Server: Admin status updated:', {
      id,
      newStatus: isActive,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { 
        success: true, 
        data: updatedAdmin,
        message: `ادمین با موفقیت ${isActive ? 'فعال' : 'غیرفعال'} شد`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Server: PATCH /api/admin Error:', { error, ipAddress, userAgent });
    return NextResponse.json(
      { success: false, error: 'خطای سرور در تغییر وضعیت ادمین' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an admin
export async function DELETE(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const authResult = await authenticateAdmin(request);
    if (authResult.error) return authResult.error;
    if (!['OWNER', 'MANAGER'].includes(authResult.admin!.role)) {
      return NextResponse.json({ success: false, error: 'دسترسی کافی ندارید' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      console.warn('🚨 Server: Missing admin ID', { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'شناسه ادمین الزامی است' }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingAdmin) {
      console.warn('🚨 Server: Admin not found for ID:', id, { ipAddress, userAgent });
      return NextResponse.json({ success: false, error: 'ادمین یافت نشد' }, { status: 404 });
    }

    await prisma.admin.delete({
      where: { id: parseInt(id) },
    });

    console.log('✅ Server: Admin deleted:', { id, ipAddress, userAgent });
    return NextResponse.json({ success: true, message: 'ادمین با موفقیت حذف شد' }, { status: 200 });
  } catch (error) {
    console.error('❌ Server: DELETE /api/admin Error:', { error, ipAddress, userAgent });
    return NextResponse.json(
      { success: false, error: 'خطای سرور در حذف ادمین' },
      { status: 500 }
    );
  }
}