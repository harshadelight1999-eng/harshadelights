import type { Metadata } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond, Poppins } from 'next/font/google'
import './globals.css'

// Client Components
import ReduxProvider from '@/components/providers/ReduxProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Harsha Delights | Premium Confectionery & Sweets',
  description: 'Discover the finest selection of sweets, chocolates, namkeens, and dry fruits. Premium quality confectionery from Harsha Delights.',
  keywords: 'sweets, chocolates, namkeens, dry fruits, confectionery, Harsha Delights, premium sweets, luxury confectionery',
  authors: [{ name: 'Harsha Delights' }],
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#7c3aed', // Royal Purple
  openGraph: {
    title: 'Harsha Delights | Premium Confectionery',
    description: 'Premium quality sweets and confectionery delivered to your doorstep.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Harsha Delights',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harsha Delights | Premium Confectionery',
    description: 'Premium quality sweets and confectionery delivered to your doorstep.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${poppins.variable} font-sans`}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
