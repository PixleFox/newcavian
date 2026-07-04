import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // If productIds provided, sync collection members
  if (body.productIds !== undefined) {
    await prisma.productCollection.deleteMany({ where: { collectionId: id } });
    if (body.productIds.length > 0) {
      await prisma.productCollection.createMany({
        data: body.productIds.map((pid: string, i: number) => ({ collectionId: id, productId: pid, sortOrder: i })),
      });
    }
  }

  const { productIds: _, ...rest } = body;
  const allowedFields = ['name', 'slug', 'description', 'image', 'isActive', 'sortOrder'];
  const updateData = Object.fromEntries(Object.entries(rest).filter(([k]) => allowedFields.includes(k)));
  const collection = Object.keys(updateData).length > 0
    ? await prisma.collection.update({ where: { id }, data: updateData })
    : await prisma.collection.findUnique({ where: { id } });
  return NextResponse.json(collection);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getSession(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.collection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
