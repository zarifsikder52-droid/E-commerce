import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { status: 'active' },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const brand = await db.brand.create({
      data: {
        name: body.name,
        slug: body.slug,
        logo: body.logo,
        description: body.description,
        status: body.status || 'active',
        sort_order: body.sort_order || 0,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}