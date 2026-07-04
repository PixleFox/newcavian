import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth-middleware';

// PATCH /api/admin/products/stock — update totalStock for a product
export async function PATCH(request: NextRequest) {
  const { error } = await authenticateAdmin(request);
  if (error) return error;

  try {
    const { productId, stock } = await request.json();

    if (!productId || stock === undefined || stock === null) {
      return NextResponse.json({ success: false, error: 'productId و stock الزامی است' }, { status: 400 });
    }

    const n = parseInt(String(stock));
    if (isNaN(n) || n < 0) {
      return NextResponse.json({ success: false, error: 'موجودی باید عدد مثبت باشد' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { totalStock: n },
      select: { id: true, totalStock: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
