import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to Medusa backend
    const medusaResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!medusaResponse.ok) {
      const error = await medusaResponse.json();
      return NextResponse.json(
        { error: error.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const data = await medusaResponse.json();

    // Set secure cookie for session
    const cookieStore = cookies();
    cookieStore.set('medusa-session', data.customer.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: data.customer.id,
        email: data.customer.email,
        first_name: data.customer.first_name,
        last_name: data.customer.last_name,
        phone: data.customer.phone,
        created_at: data.customer.created_at,
        updated_at: data.customer.updated_at,
      },
      token: data.customer.session_token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}