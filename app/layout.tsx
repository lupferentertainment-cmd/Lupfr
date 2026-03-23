import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, Playfair_Display } from 'next/font/google'
import { DeferredAnalytics } from '@/components/deferred-analytics'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-body',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-serif',
  weight: ['600', '700'],
  display: 'swap',
});

const siteUrl = 'https://lupfr.com'
const siteName = 'LUPFR Entertainment'
const defaultTitle = 'LUPFR Entertainment | SF Music Events & Talent Curation'
const defaultDescription = "San Francisco's premier music event production company. Boat parties, rooftop events, warehouse sessions, and unforgettable experiences in the Bay and beyond."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: '%s | LUPFR Entertainment',
  },
  description: defaultDescription,
  generator: 'lupfr.com',
  keywords: [
    'LUPFR',
    'Lupfer Entertainment',
    'music',
    'san francisco events',
    'boat parties',
    'dj booking',
    'nightlife',
    'event production',
    'LUPFR Entertainment',
    'SF nightlife',
    'Bay Area events',
    'warehouse parties',
    'rooftop parties',
    'house music',
    'talent booking',
    'event curator',
  ],
  formatDetection: { telephone: false },
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
    images: [{ url: '/twitter-image', width: 1200, height: 630, alt: defaultTitle }],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
      logo: `${siteUrl}/logos/will_logo.png`,
      description: defaultDescription,
      sameAs: [
        'https://www.instagram.com/lupfer_music/',
        'https://www.tiktok.com/@lupfer_entertainment',
        'https://www.youtube.com/channel/UCHuxbMyxPTeQn29q32lXOew',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/hero/hero-poster.jpg" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
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
        <DeferredAnalytics />
      </body>
    </html>
  )
}
