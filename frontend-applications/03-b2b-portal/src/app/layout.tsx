import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond, Poppins } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Harsha Delights B2B Portal',
  description: 'Wholesale ordering and account management for Harsha Delights partners',
  keywords: ['wholesale', 'confectionery', 'ordering', 'B2B', 'Harsha Delights', 'premium sweets'],
  authors: [{ name: 'Harsha Delights' }],
  themeColor: '#7c3aed', // Royal Purple
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
