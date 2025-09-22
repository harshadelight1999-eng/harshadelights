import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'hi', 'gu', 'mr'],

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: 'en',

  // Always redirect to default locale prefix
  localePrefix: 'as-needed'
});

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "_next", "api", "favicon", "icon", and other static assets
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/', '/(en|hi|gu|mr)/:path*']
};