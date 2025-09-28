import { NextRequest, NextResponse } from 'next/server';
// TODO: Fix WorkOS AuthKit imports after version compatibility resolved
// import { getSignInUrl } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement actual WorkOS sign-in after fixing import issues
    // const signInUrl = await getSignInUrl({
    //   // Optional: Specify organization ID for direct sign-in to specific org
    //   // organization: 'org_123',
    // });

    // Temporary redirect to dashboard for demo
    const signInUrl = `${request.nextUrl.origin}/dashboard`;
    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Error creating sign-in URL:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
