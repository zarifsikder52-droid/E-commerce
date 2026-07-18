import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let wishlist = await db.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sort_order: 'asc' }, take: 1 },
                brand: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sort_order: 'asc' }, take: 1 },
                  brand: true,
                  category: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Find or create wishlist
    let wishlist = await db.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await db.wishlist.create({ data: { userId } });
    }

    // Check if already in wishlist
    const existingItem = await db.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existingItem) {
      return NextResponse.json({ message: 'Product already in wishlist' }, { status: 200 });
    }

    const wishlistItem = await db.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: {
          include: {
            images: { orderBy: { sort_order: 'asc' }, take: 1 },
            brand: true,
          },
        },
      },
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
    }

    const wishlist = await db.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    const item = await db.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found in wishlist' }, { status: 404 });
    }

    await db.wishlistItem.delete({ where: { id: item.id } });

    return NextResponse.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}