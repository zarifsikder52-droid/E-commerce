import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, label, fullName, phone, address, city, state, zipCode, country, isDefault } = body;

    if (!userId || !fullName || !phone || !address || !city) {
      return NextResponse.json(
        { error: 'userId, fullName, phone, address, and city are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await db.address.create({
      data: {
        userId,
        label: label || null,
        fullName,
        phone,
        address,
        city,
        state: state || null,
        zipCode: zipCode || null,
        country: country || 'Bangladesh',
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, label, fullName, phone, address, city, state, zipCode, country, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: 'Address id is required' }, { status: 400 });
    }

    const existing = await db.address.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults first
    if (isDefault && userId) {
      await db.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id },
      data: {
        ...(label !== undefined ? { label } : {}),
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(state !== undefined ? { state } : {}),
        ...(zipCode !== undefined ? { zipCode } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(isDefault !== undefined ? { isDefault } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json({ error: 'Address id is required' }, { status: 400 });
    }

    const existing = await db.address.findUnique({ where: { id: addressId } });
    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await db.address.delete({ where: { id: addressId } });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}