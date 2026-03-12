import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-sans'
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-body'
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-serif',
  weight: ['600', '700'],
});

const siteUrl = 'https://lupfr.com'
const siteName = 'Lupfer Entertainment'
const defaultTitle = 'Lupfer Entertainment | SF House Music Events & Talent Curation'
const defaultDescription = "San Francisco's premier house music event production company. Boat parties, rooftop events, warehouse sessions, and unforgettable nightlife experiences."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | Lupfer Entertainment',
  },
  description: defaultDescription,
  generator: 'lupfr.com',
  keywords: ['house music', 'san francisco events', 'boat parties', 'dj booking', 'nightlife', 'event production', 'Lupfer Entertainment', 'SF nightlife', 'Bay Area events', 'warehouse parties', 'rooftop parties'],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [
      { url: '/opengraph-image', width: 1200, height: 630, alt: defaultTitle },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/twitter-image'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: { canonical: siteUrl },
}

export const viewport: Viewport = {
  themeColor: '#0d0d12',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      description: defaultDescription,
      sameAs: [
        'https://www.instagram.com/lupfer_entertainment/',
        'https://www.tiktok.com/@lupfer_entertainment',
        'https://www.youtube.com/@Lupfer_Entertainment',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: defaultDescription,
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${playfairDisplay.variable} font-sans antialiased bg-background text-foreground`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="sr-only">{defaultTitle}</h1>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
