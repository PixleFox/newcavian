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

function genOrderNumber() {
  const d = new Date();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${rand}`;
}

// POST /api/user/checkout
// body: { fullName, phone, address, city, postalCode, paymentMethod? }
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 });

  const body = await req.json();
  const { fullName, phone, address, city, postalCode, couponCode, discountAmount = 0 } = body;

  if (!fullName || !phone || !address || !city || !postalCode) {
    return NextResponse.json({ error: 'اطلاعات آدرس ناقص است' }, { status: 400 });
  }

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      CartItem: {
        include: {
          Product: true,
          Variant: true,
        },
      },
    },
  });

  if (!cart || cart.CartItem.length === 0) {
    return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
  }

  // Check stock
  for (const item of cart.CartItem) {
    if (item.Variant) {
      if (item.Variant.stock < item.quantity) {
        return NextResponse.json({ error: `موجودی کافی برای "${item.Product.name}" وجود ندارد` }, { status: 400 });
      }
    } else {
      if (item.Product.totalStock < item.quantity) {
        return NextResponse.json({ error: `موجودی کافی برای "${item.Product.name}" وجود ندارد` }, { status: 400 });
      }
    }
  }

  // Calculate totals
  const subtotal = cart.CartItem.reduce((s, i) => {
    const price = Number(i.Variant?.price ?? i.Product.price);
    return s + price * i.quantity;
  }, 0);
  const shippingCost = subtotal >= 500000 ? 0 : 35000;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Unique order number
    let orderNumber = genOrderNumber();
    while (await tx.order.findUnique({ where: { orderNumber } })) {
      orderNumber = genOrderNumber();
    }

    const newOrder = await tx.order.create({
      data: {
        id: randomUUID(),
        orderNumber,
        userId,
        status: 'PENDING_PAYMENT',
        subtotal,
        shippingCost,
        discountAmount,
        total,
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        updatedAt: new Date(),
        OrderItem: {
          create: cart.CartItem.map(i => ({
            id: randomUUID(),
            productId: i.productId,
            variantId: i.variantId,
            userId,
            productName: i.Product.name,
            variantName: i.Variant ? `${i.Variant.size ?? ''} ${i.Variant.color ?? ''}`.trim() : null,
            sku: i.Variant?.sku ?? i.Product.slug,
            quantity: i.quantity,
            price: Number(i.Variant?.price ?? i.Product.price),
            total: Number(i.Variant?.price ?? i.Product.price) * i.quantity,
            updatedAt: new Date(),
          })),
        },
        OrderHistory: {
          create: {
            id: randomUUID(),
            status: 'PENDING_PAYMENT',
            comment: 'سفارش ثبت شد',
          },
        },
      },
      include: { OrderItem: true },
    });

    // Update user address info
    await tx.users.update({
      where: { id: userId },
      data: {
        full_name: fullName,
        main_address: address,
        city,
        postal_code: postalCode,
        updated_at: new Date(),
      },
    });

    // Decrement stock
    for (const item of cart.CartItem) {
      if (item.variantId) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { totalStock: { decrement: item.quantity } },
        });
      }
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id }, { status: 201 });
}
