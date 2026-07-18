import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_SETTINGS: Record<string, string> = {
  storeName: 'NextShop',
  tagline: 'Your premium online shopping destination',
  currency: '৳',
  currencyCode: 'BDT',
  freeShippingMin: '2000',
  contactEmail: 'support@nextshop.com',
  phone: '+880 1234-567890',
  address: 'Dhaka, Bangladesh',
  defaultShippingRate: '60',
  taxRate: '0',
  logoUrl: '',
  faviconUrl: '',
};

async function getSetting(key: string): Promise<string> {
  const setting = await db.setting.findUnique({ where: { key } });
  return setting?.value ?? DEFAULT_SETTINGS[key] ?? '';
}

async function upsertSetting(key: string, value: string) {
  await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, type: 'string' },
  });
}

export async function GET() {
  try {
    const keys = Object.keys(DEFAULT_SETTINGS);
    const settings: Record<string, string> = {};

    // Fetch all settings that exist in DB
    const existing = await db.setting.findMany({
      where: { key: { in: keys } },
    });

    const existingMap = new Map(existing.map(s => [s.key, s.value]));

    for (const key of keys) {
      settings[key] = existingMap.get(key) ?? DEFAULT_SETTINGS[key];
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Admin get settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const allowedKeys = new Set(Object.keys(DEFAULT_SETTINGS));
    const updates: [string, string][] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.has(key)) {
        updates.push([key, String(value ?? '')]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 });
    }

    await Promise.all(updates.map(([key, value]) => upsertSetting(key, value)));

    // Return updated settings
    const allSettings: Record<string, string> = { ...DEFAULT_SETTINGS };
    const fresh = await db.setting.findMany({
      where: { key: { in: Array.from(allowedKeys) } },
    });
    for (const s of fresh) {
      allSettings[s.key] = s.value;
    }

    return NextResponse.json({ settings: allSettings, message: 'Settings saved' });
  } catch (error) {
    console.error('Admin update settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}