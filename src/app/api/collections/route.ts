import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        where: { product: { isActive: true } },
        orderBy: { sortOrder: 'asc' },
        include: {
          product: {
            select: { id: true, name: true, slug: true, price: true, compareAtPrice: true, mainImage: true, totalStock: true, isNew: true },
          },
        },
      },
    },
  });

  return NextResponse.json(collections.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    products: c.products.map(pc => pc.product),
  })));
}
