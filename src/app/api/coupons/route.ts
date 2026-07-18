import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If body has a "code" and "subtotal" field, this is a validation request
    if (body.code && body.subtotal !== undefined) {
      return validateCoupon(body.code, body.subtotal, body.userId);
    }

    // Otherwise, create a new coupon (admin)
    const coupon = await db.coupon.create({
      data: {
        code: body.code,
        type: body.type || 'percentage',
        value: body.value,
        minPurchase: body.minPurchase,
        maxDiscount: body.maxDiscount,
        usageLimit: body.usageLimit,
        applicableCategories: body.applicableCategories ? JSON.stringify(body.applicableCategories) : null,
        applicableProducts: body.applicableProducts ? JSON.stringify(body.applicableProducts) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || 'active',
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

async function validateCoupon(code: string, subtotal: number, userId?: string) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 404 });
  }

  if (coupon.status !== 'active') {
    return NextResponse.json({ valid: false, error: 'Coupon is not active' }, { status: 400 });
  }

  // Check date validity
  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    return NextResponse.json({ valid: false, error: 'Coupon is not yet active' }, { status: 400 });
  }
  if (coupon.endDate && now > coupon.endDate) {
    return NextResponse.json({ valid: false, error: 'Coupon has expired' }, { status: 400 });
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' }, { status: 400 });
  }

  // Check per-user usage limit (if userId provided, check if already used)
  if (userId) {
    const userUsage = await db.couponUsage.count({
      where: { userId, couponId: coupon.id },
    });
    if (userUsage > 0) {
      return NextResponse.json({ valid: false, error: 'You have already used this coupon' }, { status: 400 });
    }
  }

  // Check minimum purchase
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return NextResponse.json(
      { valid: false, error: `Minimum purchase amount is ${coupon.minPurchase}` },
      { status: 400 }
    );
  }

  // Calculate discount
  let discountAmount = 0;

  if (coupon.type === 'percentage') {
    discountAmount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  } else if (coupon.type === 'free_shipping') {
    discountAmount = 0;
  }

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    message:
      coupon.type === 'free_shipping'
        ? 'Free shipping applied!'
        : `You save ${discountAmount.toFixed(2)}!`,
  });
}