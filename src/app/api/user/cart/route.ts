import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

async function getUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get('user-auth')?.value;
  if (!token) return null;
  try {
    const p = jwt.verify(token, JWT_SECRET) as any;
    return p.userId || null;
  } catch { return null; }
}

async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { id: randomUUID(), userId, updatedAt: new Date() },
    });
  }
  return cart;
}

// GET /api/user/cart
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      CartItem: {
        include: {
          Product: { select: { id: true, name: true, price: true, compareAtPrice: true, mainImage: true, totalStock: true, isActive: true } },
          Variant: { select: { id: true, size: true, color: true, price: true, stock: true } },
        },
      },
    },
  });

  if (!cart) return NextResponse.json({ items: [], total: 0 });

  const items = cart.CartItem.map(i => ({
    id: i.id,
    productId: i.productId,
    variantId: i.variantId,
    quantity: i.quantity,
    price: Number(i.Variant?.price ?? i.Product.price),
    product: i.Product,
    variant: i.Variant,
  }));

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return NextResponse.json({ items, total });
}

// POST /api/user/cart  body: { productId, variantId?, quantity }
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, variantId = null, quantity = 1 } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId الزامی است' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId ?? undefined },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity, updatedAt: new Date() },
    });
  } else {
    const price = variantId
      ? ((await prisma.variant.findUnique({ where: { id: variantId } }))?.price ?? product.price)
      : product.price;
    await prisma.cartItem.create({
      data: { id: randomUUID(), cartId: cart.id, productId, variantId, quantity, price, updatedAt: new Date() },
    });
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return NextResponse.json({ success: true });
}

// DELETE /api/user/cart?itemId=xxx  or body: { clear: true }
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return NextResponse.json({ success: true });

  if (itemId) {
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  } else {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/user/cart  body: { itemId, quantity }
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId, quantity } = await req.json();
  if (!itemId || quantity < 1) return NextResponse.json({ error: 'داده نامعتبر' }, { status: 400 });

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return NextResponse.json({ error: 'سبد خرید یافت نشد' }, { status: 404 });

  await prisma.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
