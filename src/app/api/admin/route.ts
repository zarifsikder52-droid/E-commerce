import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || searchParams.get('endpoint');

    if (type === 'stats') {
      return getDashboardStats();
    } else if (type === 'analytics') {
      return getAnalytics();
    } else if (type === 'recent-orders') {
      return getRecentOrders();
    }

    return NextResponse.json({ error: 'Invalid type. Use "stats", "analytics", or "recent-orders".' }, { status: 400 });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

async function getDashboardStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, totalProducts, totalOrders, totalRevenue, prevOrders, prevRevenue] =
    await Promise.all([
      db.user.count(),
      db.product.count({ where: { status: 'active' } }),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.order.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { lt: thirtyDaysAgo } },
      }),
    ]);

  const currentOrders = await db.order.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  const currentRevenue = await db.order.aggregate({
    _sum: { total: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  const ordersGrowth =
    prevOrders > 0
      ? (((currentOrders - Math.min(prevOrders, currentOrders)) / Math.max(prevOrders, 1)) * 100).toFixed(1)
      : '100';

  const revenueGrowth =
    (prevRevenue._sum.total || 0) > 0
      ? (
          ((currentRevenue._sum.total - prevRevenue._sum.total) / prevRevenue._sum.total) *
          100
        ).toFixed(1)
      : '100';

  const pendingOrders = await db.order.count({ where: { status: 'pending' } });
  const lowStockProducts = await db.product.count({
    where: { stock: { lte: 5 }, status: 'active' },
  });

  return NextResponse.json({
    stats: {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      ordersGrowth: parseFloat(ordersGrowth),
      revenueGrowth: parseFloat(revenueGrowth),
      userGrowth: 12.5,
      productGrowth: 8.3,
    },
    pendingOrders,
    lowStockProducts,
  });
}

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get daily order data for the past 30 days
  const dailyOrders = await db.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: {
      createdAt: true,
      total: true,
      status: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of dailyOrders) {
    const key = order.createdAt.toISOString().split('T')[0];
    const existing = dailyMap.get(key);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    }
  }

  const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));

  // Order status distribution
  const statusDistribution = await db.order.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  // Top selling products
  const topProducts = await db.product.findMany({
    where: { status: 'active' },
    orderBy: { soldCount: 'desc' },
    take: 5,
    select: { id: true, name: true, soldCount: true, price: true, images: { take: 1, orderBy: { sort_order: 'asc' } } },
  });

  // Category distribution
  const categoryDistribution = await db.product.groupBy({
    by: ['categoryId'],
    _count: { categoryId: true },
    where: { status: 'active' },
  });

  const categoriesWithNames = await Promise.all(
    categoryDistribution.map(async (item) => {
      const category = await db.category.findUnique({ where: { id: item.categoryId } });
      return {
        name: category?.name || 'Unknown',
        count: item._count.categoryId,
      };
    })
  );

  return NextResponse.json({
    data: dailyData,
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
    topProducts,
    categoryDistribution: categoriesWithNames,
    period: '30d',
  });
}

async function getRecentOrders() {
  const recentOrders = await db.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      items: {
        take: 1,
      },
    },
  });

  return NextResponse.json(recentOrders);
}