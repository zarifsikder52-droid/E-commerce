import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
        coupon: {
          select: { id: true, code: true, type: true, value: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin get order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber } = body;

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;

      // Auto-update payment status for certain order status changes
      if (status === 'cancelled') {
        updateData.paymentStatus = 'refunded';
      } else if (['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
        if (existing.paymentStatus === 'pending') {
          updateData.paymentStatus = 'paid';
        }
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber || null;
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}