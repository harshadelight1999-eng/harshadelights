import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@workos-inc/authkit-nextjs';

// Configure route for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
