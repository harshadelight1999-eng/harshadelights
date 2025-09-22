import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Harsha Delights - Premium Confectionery & Sweets',
    template: '%s | Harsha Delights',
  },
  description: 'Premium confectionery, traditional sweets, chocolates, namkeens, and dry fruits. Wholesale and retail delivery across India with authentic flavors and quality ingredients.',
  keywords: [
    'confectionery',
    'sweets',
    'chocolates',
    'namkeens',
    'dry fruits',
    'traditional sweets',
    'premium confectionery',
    'wholesale sweets',
    'retail sweets',
    'Indian sweets',
    'Harsha Delights',
  ],
  authors: [{ name: 'Harsha Delights' }],
  creator: 'Harsha Delights Development Team',
  publisher: 'Harsha Delights',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'hi-IN': '/hi',
      'gu-IN': '/gu',
      'mr-IN': '/mr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Harsha Delights - Premium Confectionery & Sweets',
    description: 'Premium confectionery, traditional sweets, chocolates, namkeens, and dry fruits. Wholesale and retail delivery across India.',
    siteName: 'Harsha Delights',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Harsha Delights - Premium Confectionery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harsha Delights - Premium Confectionery & Sweets',
    description: 'Premium confectionery, traditional sweets, chocolates, namkeens, and dry fruits.',
    images: ['/images/twitter-image.jpg'],
    creator: '@harshadelights',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'food',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//api.harshadelights.com" />
        <link rel="dns-prefetch" href="//cdn.harshadelights.com" />

        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Harsha Delights',
              description: 'Premium confectionery, traditional sweets, chocolates, namkeens, and dry fruits',
              url: 'https://harshadelights.com',
              logo: 'https://harshadelights.com/images/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-98765-43210',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi', 'Gujarati', 'Marathi'],
              },
              sameAs: [
                'https://www.facebook.com/harshadelights',
                'https://www.instagram.com/harshadelights',
                'https://twitter.com/harshadelights',
              ],
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
                addressRegion: 'Your State',
                addressLocality: 'Your City',
                streetAddress: 'Your Street Address',
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-harsha-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Skip to main content
          </a>

          {/* Main application layout */}
          <div className="flex min-h-screen flex-col">
            {children}
          </div>

          {/* Analytics scripts */}
          {process.env.NODE_ENV === 'production' && (
            <>
              {/* Google Analytics */}
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                      page_title: document.title,
                      page_location: window.location.href,
                    });
                  `,
                }}
              />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}