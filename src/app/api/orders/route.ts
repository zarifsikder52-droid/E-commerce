import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          payments: { take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      subtotal,
      discount,
      shippingCharge,
      tax,
      total,
      couponId,
      paymentMethod,
      billingAddress,
      shippingAddress,
      notes,
    } = body;

    if (!userId || !items || !items.length || !paymentMethod) {
      return NextResponse.json(
        { error: 'userId, items, and paymentMethod are required' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        status: 'pending',
        subtotal,
        discount: discount || 0,
        shippingCharge: shippingCharge || 0,
        tax: tax || 0,
        total,
        couponId: couponId || null,
        paymentMethod,
        paymentStatus: 'pending',
        billingAddress: billingAddress ? JSON.stringify(billingAddress) : '{}',
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '{}',
        notes,
        items: {
          create: items.map(
            (item: {
              productId: string;
              productName: string;
              productImage?: string;
              quantity: number;
              price: number;
              total: number;
              variant?: string;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              variant: item.variant ? JSON.stringify(item.variant) : null,
            })
          ),
        },
      },
      include: { items: true },
    });

    // Decrease stock and increment soldCount for each product
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // Update coupon usage count if coupon was applied
    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });

      await db.couponUsage.create({
        data: {
          userId,
          couponId,
          orderId: order.id,
        },
      });
    }

    // Clear user cart
    const cart = await db.cart.findUnique({ where: { userId } });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Create notification
    await db.notification.create({
      data: {
        userId,
        title: 'Order Placed',
        message: `Your order ${orderNumber} has been placed successfully!`,
        type: 'order',
        data: JSON.stringify({ orderId: order.id, orderNumber }),
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}