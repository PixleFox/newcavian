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

// GET /api/admin/products/:id - Get a single product by ID
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

    const product = await prisma.product.findUnique({
      where: { id },
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Product not found' 
        }), 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/:id - Update a product
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Product not found' 
        }), 
        { status: 404 }
      );
    }


    // Update product with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the product
      const product = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          description: data.description,
          ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          costPrice: data.costPrice ?? null,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          mainImage: data.mainImage,
          images: data.images || [],
          videoUrl: data.videoUrl ?? null,
          weight: data.weight ?? null,
          dimensions: data.dimensions ?? null,
          material: data.material ?? null,
          availableSizes: data.availableSizes || [],
          tags: data.tags || [],
          gender: data.gender ?? null,
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
          ...(adminId && { updatedBy: { connect: { id: adminId } } })
        }
      });

      // Update or create variants
      if (data.variants && Array.isArray(data.variants)) {
        // Delete existing variants not in the update
        await tx.variant.deleteMany({
          where: {
            productId: id,
            NOT: {
              id: {
                in: data.variants
                  .filter((v: any) => v.id)
                  .map((v: any) => v.id),
              },
            },
          },
        });

        // Update or create variants
        await Promise.all(
          data.variants.map(async (variant: any) => {
            if (variant.id) {
              // Update existing variant
              return tx.variant.update({
                where: { id: variant.id },
                data: {
                  sku: variant.sku,
                  barcode: variant.barcode,
                  size: variant.size,
                  color: variant.color,
                  colorHex: variant.colorHex,
                  price: variant.price,
                  stock: variant.stock,
                  isActive: variant.isActive,
                  image: variant.image,
                },
              });
            } else {
              // Create new variant
              return tx.variant.create({
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
                    connect: { id },
                  },
                },
              });
            }
          })
        );
      }

      // Update type-specific attributes
      if (data.type === 'T_SHIRT' && data.clothingAttributes) {
        await tx.clothingAttributes.upsert({
          where: { productId: id },
          update: {
            fit: data.clothingAttributes.fit,
            sleeveType: data.clothingAttributes.sleeveType,
            neckType: data.clothingAttributes.neckType,
            pattern: data.clothingAttributes.pattern,
            care: data.clothingAttributes.care,
            fabricType: data.clothingAttributes.fabricType,
            origin: data.clothingAttributes.origin,
          },
          create: {
            productId: id,
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

    // Fetch the updated product with relations
    const updatedProduct = await prisma.product.findUnique({
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

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id - Delete a product
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
    
    // Admin ID is already verified at the start of the function

    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Product not found' 
        }), 
        { status: 404 }
      );
    }

    // Use transaction to delete related records
    await prisma.$transaction([
      // Delete variants first due to foreign key constraint
      prisma.variant.deleteMany({
        where: { productId: id },
      }),
      // Delete type-specific attributes
      prisma.clothingAttributes.deleteMany({
        where: { productId: id },
      }),
      prisma.mugAttributes.deleteMany({
        where: { productId: id },
      }),
      prisma.accessoryAttributes.deleteMany({
        where: { productId: id },
      }),
      // Finally, delete the product
      prisma.product.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
}
