import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Client Components
import ReduxProvider from '@/components/providers/ReduxProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Harsha Delights | Premium Confectionery & Sweets',
  description: 'Discover the finest selection of sweets, chocolates, namkeens, and dry fruits. Premium quality confectionery from Harsha Delights.',
  keywords: 'sweets, chocolates, namkeens, dry fruits, confectionery, Harsha Delights',
  authors: [{ name: 'Harsha Delights' }],
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#dec90a',
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
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
