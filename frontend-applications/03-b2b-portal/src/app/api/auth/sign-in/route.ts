import { NextRequest, NextResponse } from 'next/server';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

// Web Service deployment - restore dynamic configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const signInUrl = await getSignInUrl({
      // Optional: Specify organization ID for direct sign-in to specific org
      organizationId: request.nextUrl.searchParams.get('organization') || undefined,
      // Add return URL for post-auth redirect  
      redirectUri: request.nextUrl.searchParams.get('returnTo') || '/dashboard',
    });

    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Error creating sign-in URL:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
