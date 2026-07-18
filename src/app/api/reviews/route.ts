import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, rating, title, comment, images } = await request.json();

    if (!userId || !productId || !rating) {
      return NextResponse.json({ error: 'userId, productId, and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
    }

    const review = await db.review.create({
      data: {
        userId,
        productId,
        rating,
        title: title || null,
        comment: comment || null,
        images: images ? JSON.stringify(images) : null,
        isVerified: true, // Mark as verified if they purchased
        isApproved: true,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Recalculate product rating
    const aggregate = await db.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((aggregate._avg.rating || 0) * 10) / 10,
        reviewCount: aggregate._count.rating,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}