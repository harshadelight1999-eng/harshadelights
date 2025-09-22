import { NextRequest, NextResponse } from 'next/server';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    const signInUrl = await getSignInUrl({
      // Optional: Specify organization ID for direct sign-in to specific org
      // organization: 'org_123',
      redirectUri: `${request.nextUrl.origin}/auth/callback`,
    });

    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Error creating sign-in URL:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
