import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentOnly = searchParams.get('parentOnly') === 'true';

    if (parentOnly) {
      const categories = await db.category.findMany({
        where: { parentId: null, status: 'active' },
        include: {
          _count: { select: { children: true, products: true } },
        },
        orderBy: { sort_order: 'asc' },
      });
      return NextResponse.json(categories);
    }

    const categories = await db.category.findMany({
      where: { status: 'active' },
      include: {
        children: {
          where: { status: 'active' },
          include: {
            _count: { select: { products: true } },
          },
          orderBy: { sort_order: 'asc' },
        },
        _count: { select: { children: true, products: true } },
      },
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const category = await db.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        banner: body.banner,
        parentId: body.parentId || null,
        status: body.status || 'active',
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
        sort_order: body.sort_order || 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}