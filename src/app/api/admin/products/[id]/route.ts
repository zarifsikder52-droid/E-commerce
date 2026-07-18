import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { orderBy: { sort_order: 'asc' } },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await db.product.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'slug', 'categoryId', 'brandId', 'price', 'discountPrice',
      'stock', 'shortDesc', 'description', 'status',
      'isFeatured', 'isTrending', 'isBestSeller', 'isNewArrival',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'price' || field === 'discountPrice') {
          updateData[field] = body[field] != null ? parseFloat(body[field]) : null;
        } else if (field === 'stock') {
          updateData[field] = parseInt(body[field]) || 0;
        } else if (['isFeatured', 'isTrending', 'isBestSeller', 'isNewArrival'].includes(field)) {
          updateData[field] = !!body[field];
        } else if (field === 'brandId') {
          updateData[field] = body[field] || null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        images: { take: 1, orderBy: { sort_order: 'asc' } },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Soft delete by setting status to 'draft'
    await db.product.update({
      where: { id },
      data: { status: 'draft' },
    });

    return NextResponse.json({ success: true, message: 'Product archived (soft deleted)' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}