import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        _count: {
          select: { products: true, children: true },
        },
        children: {
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Admin categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, parentId, image, status } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
        image: image || null,
        status: status || 'active',
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Admin create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}