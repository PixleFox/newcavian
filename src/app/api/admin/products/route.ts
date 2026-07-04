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
          JSON.stringify({ 
            success: false, 
            error: 'خطای احراز هویت',
            message: 'لطفاً ابتدا وارد حساب کاربری خود شوید',
            errorCode: 'AUTH_REQUIRED',
            status: 401
          }), 
          { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
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
          JSON.stringify({ 
            success: false, 
            error: 'خطای دسترسی',
            message: 'نشست شما منقضی شده یا نامعتبر است. لطفاً مجدداً وارد شوید',
            errorCode: 'INVALID_SESSION',
            status: 401
          }), 
          { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        )
      };
    }
    
    return { adminId: admin.id };
  } catch (error) {
    console.error('خطای احراز هویت:', error);
    return { 
      adminId: null,
      errorResponse: new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای سرور',
          message: 'خطایی در احراز هویت رخ داده است',
          errorCode: 'AUTH_ERROR',
          details: error instanceof Error ? error.message : 'خطای ناشناخته',
          status: 500
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      )
    };
  }
}

// GET /api/admin/products - Get all products with pagination and filtering
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');

    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with related data
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            stock: true,
            isActive: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  } catch (error) {
    console.error('خطا در دریافت لیست محصولات:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'خطای سرور',
        message: 'خطا در دریافت لیست محصولات',
        errorCode: 'PRODUCTS_FETCH_ERROR',
        details: error instanceof Error ? error.message : 'خطای ناشناخته',
        status: 500
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}

// POST /api/admin/products - Create a new product
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
    const missingFields = [];
    if (!data.name) missingFields.push('نام محصول');
    if (!data.categoryId) missingFields.push('دسته‌بندی');
    if (data.price === undefined || data.price === null) missingFields.push('قیمت');
    
    if (missingFields.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'خطای اعتبارسنجی',
          message: 'لطفاً فیلدهای اجباری را تکمیل کنید',
          errorCode: 'VALIDATION_ERROR',
          details: {
            missingFields,
            message: `فیلدهای اجباری: ${missingFields.join('، ')}`
          },
          status: 400
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Create product with transaction to handle variants
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Calculate total stock from variants if provided, otherwise default to 0
      const totalStock = data.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
      
      // Create the product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug || `${data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
          description: data.description || '',
          type: data.type || 'T_SHIRT',
          category: { connect: { id: data.categoryId } },
          gender: data.gender ?? null,
          tags: data.tags || [],
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          costPrice: data.costPrice ?? null,
          totalStock,
          isActive: data.isActive ?? false,
          isFeatured: data.isFeatured ?? false,
          isNew: data.isNew ?? true,
          manageStock: data.manageStock ?? true,
          mainImage: data.mainImage ?? null,
          images: data.images || [],
          videoUrl: data.videoUrl ?? null,
          weight: data.weight ?? null,
          dimensions: data.dimensions ?? null,
          material: data.material ?? null,
          availableSizes: data.availableSizes || [],
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
          createdBy: { connect: { id: adminId } },
          updatedBy: { connect: { id: adminId } }
        }
      });

      // Create variants if provided
      if (data.variants && data.variants.length > 0) {
        await Promise.all(
          data.variants.map((variant: any) =>
            tx.variant.create({
              data: {
                sku: variant.sku,
                barcode: variant.barcode,
                size: variant.size,
                color: variant.color,
                colorHex: variant.colorHex,
                price: variant.price,
                stock: variant.stock || 0,
                isActive: variant.isActive ?? true,
                image: variant.image,
                product: {
                  connect: { id: product.id },
                },
              },
            })
          )
        );
      }

      // Create type-specific attributes if provided
      if (data.type === 'T_SHIRT' && data.clothingAttributes) {
        await tx.clothingAttributes.create({
          data: {
            productId: product.id,
            fit: data.clothingAttributes.fit,
            sleeveType: data.clothingAttributes.sleeveType,
            neckType: data.clothingAttributes.neckType,
            pattern: data.clothingAttributes.pattern,
            care: data.clothingAttributes.care,
            fabricType: data.clothingAttributes.fabricType,
            origin: data.clothingAttributes.origin,
          },
        });
      }

      // Add other attribute types (Mug, Accessory) as needed
      return product;
    });

    // Fetch the complete product with relations
    const createdProduct = await prisma.product.findUnique({
      where: { id: result.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
        clothingAttributes: true,
        mugAttributes: true,
        accessoryAttributes: true,
      },
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'محصول با موفقیت ایجاد شد',
        data: createdProduct 
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  } catch (error: unknown) {
    console.error('خطا در ایجاد محصول:', error);
    
    // Define error details with proper typing
    const errorDetails: {
      message: string;
      stack?: string;
      code?: string;
      meta?: any;
    } = {
      message: error instanceof Error ? error.message : 'خطای ناشناخته رخ داد'
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      errorDetails.stack = error.stack;
    }

    // Add error code and meta if they exist
    if (error && typeof error === 'object') {
      if ('code' in error) {
        errorDetails.code = (error as { code: string }).code;
      }
      if ('meta' in error) {
        errorDetails.meta = (error as { meta: any }).meta;
      }
    }

    // Handle Prisma errors
    if (errorDetails.code === 'P2002') {
      const field = (errorDetails.meta?.target?.[0] as string) || 'فیلد تکراری';
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'خطای اعتبارسنجی',
          message: 'اطلاعات تکراری',
          errorCode: 'DUPLICATE_ENTRY',
          details: {
            field,
            message: `${field} تکراری است. لطفاً مقدار دیگری انتخاب کنید.`
          },
          status: 400
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    
    if (errorDetails.code === 'P2025') {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'خطای اعتبارسنجی',
          message: 'داده‌های ارسالی نامعتبر است',
          errorCode: 'INVALID_DATA',
          details: {
            message: 'دسته‌بندی مورد نظر یافت نشد. لطفاً از صحت اطلاعات اطمینان حاصل کنید.'
          },
          status: 400
        }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Default error response
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'خطای سرور',
        message: 'خطا در ایجاد محصول',
        errorCode: 'PRODUCT_CREATION_ERROR',
        details: {
message: errorDetails.message,
          ...(process.env.NODE_ENV === 'development' ? { stack: errorDetails.stack } : {})
        },
        status: 500
      }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}
