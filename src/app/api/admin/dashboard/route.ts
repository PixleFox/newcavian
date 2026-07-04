import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if ('error' in auth) return auth.error;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsers,
    totalOrders, pendingOrders, totalRevenue,
    totalProducts, activeProducts,
    openTickets,
  ] = await Promise.all([
    prisma.users.count({ where: { deleted_at: null } }),
    prisma.users.count({ where: { deleted_at: null, created_at: { gte: sevenDaysAgo } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['DELIVERED', 'PROCESSING', 'SHIPPED'] } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers, newUsers,
      totalOrders, pendingOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalProducts, activeProducts,
      openTickets,
    },
  });
}
