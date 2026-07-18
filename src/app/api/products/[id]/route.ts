import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sort_order: 'asc' } },
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Increment view count
    await db.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { images, variants, ...productData } = body;

    const updateData: Prisma.ProductUpdateInput = {
      ...productData,
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images.map((img: { url: string; alt?: string; sort_order?: number }) => ({
                url: img.url,
                alt: img.alt,
                sort_order: img.sort_order || 0,
              })),
            },
          }
        : {}),
      ...(variants
        ? {
            variants: {
              deleteMany: {},
              create: variants.map((v: { name: string; value: string; sku?: string; price?: number; stock?: number }) => ({
                name: v.name,
                value: v.value,
                sku: v.sku,
                price: v.price,
                stock: v.stock || 0,
              })),
            },
          }
        : {}),
    };

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sort_order: 'asc' } },
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}