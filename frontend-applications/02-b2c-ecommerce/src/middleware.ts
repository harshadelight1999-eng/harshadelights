import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled internationalization for basic functionality
// Simple pass-through middleware to satisfy Next.js requirements
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|.*\\..*).*)']
};

// Previous i18n configuration for future reference:
// import createMiddleware from 'next-intl/middleware';
//
// export default createMiddleware({
//   locales: ['en', 'hi', 'gu', 'mr'],
//   defaultLocale: 'en'
// });