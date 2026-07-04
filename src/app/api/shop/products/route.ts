import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '24');
    const search   = searchParams.get('search')   || '';
    const category = searchParams.get('category') || '';
    const skip     = (page - 1) * limit;

    const where: any = { isActive: true };

    if (searchParams.get('isNew') === 'true') where.isNew = true;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      // Support filtering by category name (Persian) or slug
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { name: category },
            { slug: category },
          ],
        },
        select: { id: true },
      });
      if (cat) {
        where.categoryId = cat.id;
      } else {
        // No matching category → return empty
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        });
      }
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: {
          id: true, name: true, slug: true, price: true, compareAtPrice: true,
          mainImage: true, images: true, isNew: true, isFeatured: true,
          totalStock: true, isActive: true, tags: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
