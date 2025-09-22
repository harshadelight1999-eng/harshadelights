import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@workos-inc/authkit-nextjs';

export async function POST(request: NextRequest) {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
