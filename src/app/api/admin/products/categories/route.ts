import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AdminJwtPayload {
  adminId: number;
  phoneNumber: string;
  iat: number;
  exp: number;
}

// Helper function to verify admin session
async function verifyAdminSession(request: Request): Promise<{ adminId: number | null; errorResponse?: NextResponse }> {
  try {
    // Extract admin-auth cookie from request headers
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'admin-auth') {
        acc.set(key, value);
      }
      return acc;
    }, new Map<string, string>());
    const adminAuthCookie = cookies.get('admin-auth') || '';

    if (!adminAuthCookie) {
      return { 
        adminId: null,
        errorResponse: new NextResponse(
          JSON.stringify({ success: false, error: 'Authentication required' }), 
          { status: 401 }
        )
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(adminAuthCookie, JWT_SECRET) as unknown as AdminJwtPayload;
    
    // Verify admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: {
        id: decoded.adminId,
        phoneNumber: decoded.phoneNumber,
        isActive: true,
      },
      select: { id: true }
    });

    if (!admin) {
      return { 
        adminId: null,
        errorResponse: new NextResponse(
          JSON.stringify({ success: false, error: 'Invalid or expired session' }), 
          { status: 401 }
        )
      };
    }
    
    return { adminId: admin.id };
  } catch (error) {
    console.error('Session verification error:', error);
    return { 
      adminId: null,
      errorResponse: new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Authentication error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }), 
        { status: 500 }
      )
    };
  }
}

// GET /api/admin/products/categories - Get all categories with optional tree structure
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const { adminId, errorResponse } = await verifyAdminSession(request);
    if (errorResponse) return errorResponse;
    if (!adminId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tree = searchParams.get('tree') === 'true';
    const parentId = searchParams.get('parentId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build the where clause
    const where: any = {};
    
    if (parentId === 'root') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    // Get categories
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    // If tree structure is requested, build the hierarchy
    if (tree) {
      const buildTree = async (parentId: string | null = null): Promise<any[]> => {
        const items = await prisma.category.findMany({
          where: { ...where, parentId },
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        });

        return Promise.all(
          items.map(async (category) => ({
            ...category,
            children: await buildTree(category.id),
          }))
        );
      };

      const categoryTree = await buildTree(parentId === 'root' ? null : parentId || null);
      return NextResponse.json({
        success: true,
        data: categoryTree,
      });
    }

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}

// POST /api/admin/products/categories - Create a new category
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const { adminId, errorResponse } = await verifyAdminSession(request);
    if (errorResponse) return errorResponse;
    if (!adminId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'نام دسته‌بندی الزامی است',
          errorCode: 'NAME_REQUIRED',
          status: 400
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Check if category name already exists
    const existingName = await prisma.category.findFirst({
      where: { 
        name: data.name,
      },
    });

    if (existingName) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'دسته‌بندی با این نام از قبل وجود دارد',
          errorCode: 'DUPLICATE_CATEGORY_NAME',
          status: 400
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Generate slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');

    // Check if slug is already in use
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'آدرس دسته‌بندی تکراری است. لطفاً آدرس دیگری انتخاب کنید.',
          errorCode: 'DUPLICATE_SLUG',
          status: 400
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Get the highest order value for the current level
    const maxOrder = await prisma.category.aggregate({
      where: { parentId: data.parentId || null },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order || 0) + 1;

    try {
      // Create the category
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description || '',
          image: data.image || '',
          bannerImage: data.bannerImage || '',
          parentId: data.parentId || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
          featured: data.featured || false,
          order: data.order !== undefined ? data.order : newOrder,
        },
      });

      return new NextResponse(
        JSON.stringify({ 
          success: true,
          message: 'دسته‌بندی با موفقیت ایجاد شد',
          data: category 
        }),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    } catch (error: any) {
      console.error('خطا در ایجاد دسته‌بندی:', error);
      
      // Handle Prisma errors
      if (error.code === 'P2003') {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'خطای اعتبارسنجی',
            message: 'دسته‌بندی والد نامعتبر است',
            errorCode: 'INVALID_PARENT_CATEGORY',
            status: 400
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      }
      
      // Default error response
      throw error; // This will be caught by the outer catch block
    }
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    console.error('خطا در ایجاد دسته‌بندی:', error);
    // Define error details with proper typing
    const errorDetails: {
      message: string;
      stack?: string;
      code?: string;
    } = {
      message: error instanceof Error ? error.message : 'خطای ناشناخته رخ داد'
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorDetails.stack = error.stack;
    }

    // Add error code if it exists
    if (error && typeof error === 'object' && 'code' in error) {
      errorDetails.code = (error as { code: string }).code;
    }

    const errorResponse = {
      success: false, 
      error: 'خطای سرور',
      message: 'خطا در ایجاد دسته‌بندی',
      errorCode: 'CATEGORY_CREATION_ERROR',
      details: errorDetails,
      status: 500
    };

    return new NextResponse(
      JSON.stringify(errorResponse), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}
