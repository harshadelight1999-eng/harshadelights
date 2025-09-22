import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await request.json();

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Connect to Medusa backend
    const medusaResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name,
      }),
    });

    if (!medusaResponse.ok) {
      const error = await medusaResponse.json();
      return NextResponse.json(
        { error: error.message || 'Registration failed' },
        { status: 400 }
      );
    }

    const data = await medusaResponse.json();

    // Auto-login after registration
    const loginResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();

      // Set secure cookie for session
      const cookieStore = cookies();
      cookieStore.set('medusa-session', loginData.customer.session_token, {
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
        token: loginData.customer.session_token,
      });
    }

    // If auto-login fails, still return success for registration
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
      message: 'Registration successful. Please log in.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}