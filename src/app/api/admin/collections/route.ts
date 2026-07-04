import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!await getSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const collections = await prisma.collection.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { products: { include: { product: { select: { id: true, name: true, mainImage: true } } } } },
  });
  return NextResponse.json(collections);
}

export async function POST(req: NextRequest) {
  if (!await getSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, image, isActive, sortOrder } = body;

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  const finalSlug = slug || `col-${Date.now()}`;

  const collection = await prisma.collection.create({
    data: { name, slug: finalSlug, description, image, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(collection, { status: 201 });
}
