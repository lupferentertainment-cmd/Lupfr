import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-body'
});

export const metadata: Metadata = {
  title: 'Lupfer Entertainment | SF House Music Events & Talent Curation',
  description: 'San Francisco\'s premier house music event production company. Boat parties, rooftop events, warehouse sessions, and unforgettable nightlife experiences.',
  generator: 'lupfr.com',
  keywords: ['house music', 'san francisco events', 'boat parties', 'dj booking', 'nightlife', 'event production'],
  authors: [{ name: 'Lupfer Entertainment' }],
  openGraph: {
    title: 'Lupfer Entertainment | SF House Music Events',
    description: 'San Francisco\'s premier house music event production company.',
    url: 'https://lupfr.com',
    siteName: 'Lupfer Entertainment',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lupfer Entertainment',
    description: 'San Francisco\'s premier house music event production company.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d12',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
