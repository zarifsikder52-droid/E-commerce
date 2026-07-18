import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const bestSeller = searchParams.get('bestSeller');
    const newArrival = searchParams.get('newArrival');
    const inStock = searchParams.get('inStock');
    const onSale = searchParams.get('onSale');

    const where: Prisma.ProductWhereInput = { status: 'active' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      // Include products from subcategories
      const childCategoryIds = await db.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      const allCategoryIds = [categoryId, ...childCategoryIds.map(c => c.id)];
      where.categoryId = { in: allCategoryIds };
    }
    if (brandId) where.brandId = brandId;
    if (minPrice !== null && minPrice !== '') where.price = { ...((where.price as Prisma.FloatFilter) || {}), gte: parseFloat(minPrice) };
    if (maxPrice !== null && maxPrice !== '') where.price = { ...((where.price as Prisma.FloatFilter) || {}), lte: parseFloat(maxPrice) };
    if (rating) where.rating = { gte: parseFloat(rating) };
    if (featured === 'true') where.isFeatured = true;
    if (trending === 'true') where.isTrending = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (newArrival === 'true') where.isNewArrival = true;
    if (inStock === 'true') where.stock = { gt: 0 };
    if (onSale === 'true') where.discountPrice = { not: null, gt: 0 };

    const allowedSortFields = ['createdAt', 'price', 'name', 'rating', 'soldCount', 'viewCount'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    (orderBy as Record<string, string>)[sortField] = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sort_order: 'asc' } },
          variants: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        shortDesc: body.shortDesc,
        description: body.description,
        sku: body.sku,
        barcode: body.barcode,
        categoryId: body.categoryId,
        brandId: body.brandId,
        price: body.price,
        discountPrice: body.discountPrice,
        costPrice: body.costPrice,
        stock: body.stock,
        weight: body.weight,
        length: body.length,
        width: body.width,
        height: body.height,
        tags: body.tags,
        warranty: body.warranty,
        returnPolicy: body.returnPolicy,
        shippingInfo: body.shippingInfo,
        status: body.status || 'active',
        isFeatured: body.isFeatured || false,
        isTrending: body.isTrending || false,
        isBestSeller: body.isBestSeller || false,
        isNewArrival: body.isNewArrival || false,
        isDigital: body.isDigital || false,
        lowStockAlert: body.lowStockAlert || 5,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
        seoKeywords: body.seoKeywords,
        images: body.images
          ? {
              create: body.images.map((img: { url: string; alt?: string; sort_order?: number }) => ({
                url: img.url,
                alt: img.alt,
                sort_order: img.sort_order || 0,
              })),
            }
          : undefined,
        variants: body.variants
          ? {
              create: body.variants.map((v: { name: string; value: string; sku?: string; price?: number; stock?: number }) => ({
                name: v.name,
                value: v.value,
                sku: v.sku,
                price: v.price,
                stock: v.stock || 0,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}