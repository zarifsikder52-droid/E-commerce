import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.name = { contains: search };
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { take: 1, orderBy: { sort_order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error('Admin products list error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, slug, categoryId, brandId, price, discountPrice,
      stock, shortDesc, description, status,
      isFeatured, isTrending, isBestSeller, isNewArrival,
    } = body;

    if (!name || !slug || !categoryId || price == null) {
      return NextResponse.json(
        { error: 'Name, slug, categoryId, and price are required' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        categoryId,
        brandId: brandId || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock) || 0,
        shortDesc: shortDesc || null,
        description: description || null,
        status: status || 'active',
        isFeatured: !!isFeatured,
        isTrending: !!isTrending,
        isBestSeller: !!isBestSeller,
        isNewArrival: !!isNewArrival,
      },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { take: 1, orderBy: { sort_order: 'asc' } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Admin create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}