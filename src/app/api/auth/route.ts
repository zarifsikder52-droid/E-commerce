import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      return handleLogin(body);
    } else if (action === 'register') {
      return handleRegister(body);
    } else if (action === 'forgot-password') {
      return handleForgotPassword(body);
    }

    return NextResponse.json({ error: 'Invalid action. Use "login", "register", or "forgot-password".' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

async function handleLogin(body: Record<string, unknown>) {
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (!user.password) {
    return NextResponse.json({ error: 'Account uses a different sign-in method' }, { status: 400 });
  }

  if (!user.isActive) {
    return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
  }

  const isValid = await compare(password, user.password);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const { password: _, ...userWithoutPassword } = user;
  return NextResponse.json({ user: userWithoutPassword });
}

async function handleRegister(body: Record<string, unknown>) {
  const { name, email, phone, password } = body as {
    name: string;
    email: string;
    phone?: string;
    password: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: 'customer',
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
}

async function handleForgotPassword(body: Record<string, unknown>) {
  const { email } = body as { email: string };

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  return NextResponse.json({ message: 'If an account with this email exists, a reset link has been sent.' });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email query parameter is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 });
  }
}