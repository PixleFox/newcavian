import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        variants: { where: { isActive: true }, orderBy: [{ color: 'asc' }, { size: 'asc' }] },
        category: { select: { id: true, name: true, slug: true } },
        clothingAttributes: true,
        sizeGuide: true,
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد' }, { status: 404 });
    }

    // Get 6 related products from same category
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      select: {
        id: true, name: true, slug: true, price: true, compareAtPrice: true,
        mainImage: true, images: true, isNew: true, totalStock: true,
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: { product, related } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
