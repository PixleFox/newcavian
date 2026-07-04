import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { Permission, hasPermission } from './permissions';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AdminJwtPayload {
  adminId: number;
  phoneNumber: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate an admin and verify permissions
 * @param request The Next.js request object
 * @param requiredPermissions Optional permissions to check
 * @returns Object with admin data or error response
 */
export async function authenticateAdmin(
  request: NextRequest,
  requiredPermissions?: Permission | Permission[]
) {
  try {
    // Extract admin-auth cookie
    const cookies = request.cookies || new Map();
    const adminAuthCookie = cookies.get('admin-auth')?.value;

    if (!adminAuthCookie) {
      return {
        error: NextResponse.json(
          { success: false, error: 'لطفاً ابتدا وارد حساب کاربری خود شوید' },
          { status: 401 }
        ),
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(adminAuthCookie, JWT_SECRET) as AdminJwtPayload;

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
      return {
        error: NextResponse.json(
          { success: false, error: 'حساب کاربری غیرفعال است یا وجود ندارد' },
          { status: 401 }
        ),
      };
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
      return {
        error: NextResponse.json(
          { success: false, error: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید' },
          { status: 401 }
        ),
      };
    }

    // Check permissions if required
    if (requiredPermissions) {
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasAllPermissions = permissions.every(permission => 
        hasPermission(admin.role, permission)
      );

      if (!hasAllPermissions) {
        return {
          error: NextResponse.json(
            { success: false, error: 'شما دسترسی لازم برای انجام این عملیات را ندارید' },
            { status: 403 }
          ),
        };
      }
    }

    return { admin };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        error: NextResponse.json(
          { success: false, error: 'توکن نامعتبر است' },
          { status: 401 }
        ),
      };
    }

    if (error instanceof jwt.TokenExpiredError) {
      return {
        error: NextResponse.json(
          { success: false, error: 'توکن منقضی شده است. لطفاً دوباره وارد شوید' },
          { status: 401 }
        ),
      };
    }

    console.error('Authentication error:', error);
    return {
      error: NextResponse.json(
        { success: false, error: 'خطای احراز هویت' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Get client IP address from request
 * @param request The Next.js request object
 * @returns The client IP address
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return ip === '::1' ? '127.0.0.1' : ip;
}

/**
 * Get user agent from request
 * @param request The Next.js request object
 * @returns The user agent string
 */
export function getUserAgent(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  return userAgent.length > 255 ? userAgent.substring(0, 255) : userAgent;
}
