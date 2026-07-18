import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sort_order: 'asc' }, take: 1 },
                brand: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Auto-create cart if it doesn't exist
    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sort_order: 'asc' }, take: 1 },
                  brand: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity, variantId } = await request.json();

    if (!userId || !productId) {
      return NextResponse.json({ error: 'userId and productId are required' }, { status: 400 });
    }

    // Check product exists and has stock
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const qty = quantity || 1;

    if (variantId) {
      const variant = await db.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
      }
      if (variant.stock < qty) {
        return NextResponse.json({ error: 'Insufficient variant stock' }, { status: 400 });
      }
    } else if (product.stock < qty) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Find or create cart
    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (existingItem) {
      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty },
        include: {
          product: { include: { images: { orderBy: { sort_order: 'asc' }, take: 1 } } },
        },
      });
      return NextResponse.json(updatedItem);
    }

    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: qty,
        variantId: variantId || null,
      },
      include: {
        product: { include: { images: { orderBy: { sort_order: 'asc' }, take: 1 } } },
      },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'cartItemId and quantity are required' }, { status: 400 });
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    const existingItem = await db.cartItem.findUnique({ where: { id: cartItemId } });
    if (!existingItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const updatedItem = await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: { include: { images: { orderBy: { sort_order: 'asc' }, take: 1 } } },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return NextResponse.json({ error: 'cartItemId is required' }, { status: 400 });
    }

    const existingItem = await db.cartItem.findUnique({ where: { id: cartItemId } });
    if (!existingItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    await db.cartItem.delete({ where: { id: cartItemId } });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}