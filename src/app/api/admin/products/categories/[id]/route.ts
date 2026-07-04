import { NextResponse } from 'next/server';
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

type Params = {
  params: {
    id: string;
  };
};

// GET /api/admin/products/categories/:id - Get a single category by ID
export async function GET(request: Request, { params }: Params) {
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

    const { id } = params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            products: true,
            children: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Category not found' 
        }), 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/categories/:id - Update a category
export async function PUT(request: Request, { params }: Params) {
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

    const { id } = params;
    const data = await request.json();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطا',
          message: 'دسته‌بندی مورد نظر یافت نشد',
          errorCode: 'CATEGORY_NOT_FOUND',
          status: 404
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (nameExists) {
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
    }

    // Only update slug if explicitly provided or if name is being updated
    let slug = data.slug || existingCategory.slug;
    if (data.name && data.name !== existingCategory.name && !data.slug) {
      slug = data.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Check if new slug is already in use by another category
    if (slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
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
    }

    // Prevent circular references in parent-child relationship
    if (data.parentId === id) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'یک دسته‌بندی نمی‌تواند والد خودش باشد',
          errorCode: 'INVALID_PARENT',
          status: 400
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        bannerImage: data.bannerImage,
        parentId: data.parentId,
        isActive: data.isActive,
        featured: data.featured,
        order: data.order,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
      data: updatedCategory,
    });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    console.error('خطا در به‌روزرسانی دسته‌بندی:', error);
    
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

    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'خطای سرور',
        message: 'خطا در به‌روزرسانی دسته‌بندی',
        errorCode: 'CATEGORY_UPDATE_ERROR',
        details: errorDetails,
        status: 500
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

// DELETE /api/admin/products/categories/:id - Delete a category
export async function DELETE(request: Request, { params }: Params) {
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

    const { id } = params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطا',
          message: 'دسته‌بندی مورد نظر یافت نشد',
          errorCode: 'CATEGORY_NOT_FOUND',
          status: 404
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Prevent deletion if category has products or children
    if (existingCategory._count.products > 0) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'امکان حذف دسته‌بندی حاوی محصول وجود ندارد',
          errorCode: 'CATEGORY_HAS_PRODUCTS',
          status: 400
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    if (existingCategory._count.children > 0) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'امکان حذف دسته‌بندی دارای زیردسته وجود ندارد. لطفاً ابتدا زیردسته‌ها را حذف یا انتقال دهید.',
          errorCode: 'CATEGORY_HAS_SUBCATEGORIES',
          status: 400
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد',
    });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    console.error('خطا در حذف دسته‌بندی:', error);
    
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

    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'خطای سرور',
        message: 'خطا در حذف دسته‌بندی',
        errorCode: 'CATEGORY_DELETION_ERROR',
        details: errorDetails,
        status: 500
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}
