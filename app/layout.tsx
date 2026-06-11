import type { Metadata, Viewport } from 'next'
import { CookieConsent } from '@/components/cookie-consent'
import { DeferredAnalytics } from '@/components/deferred-analytics'
import { EscapeBack } from '@/components/escape-back'
import { LiquidMetalCanvas } from '@/components/liquid-metal-canvas'
import { PrefetchHomeRoute } from '@/components/prefetch-home-route'
import { PhoneListPopup } from '@/components/phone-list-popup'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const siteName = 'LUPFR Entertainment'
const defaultTitle = 'LUPFR Entertainment | SF & LA Music Events & Talent Curation'
const defaultDescription = "California's premier music event production company. Boat parties, rooftop events, warehouse sessions, and unforgettable experiences across SF and LA."

export const metadata: Metadata = {
  metadataBase: new URL("https://lupfr.com"),
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
    'los angeles events',
    'california events',
    'boat parties',
    'dj booking',
    'nightlife',
    'event production',
    'LUPFR Entertainment',
    'SF nightlife',
    'LA nightlife',
    'Bay Area events',
    'warehouse parties',
    'rooftop parties',
    'house music',
    'talent booking',
    'event curator',
  ],
  formatDetection: { telephone: false },
  authors: [{ name: siteName, url: SITE_URL }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_URL,
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [
      { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: defaultTitle },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: `${SITE_URL}/twitter-image`, width: 1200, height: 630, alt: defaultTitle }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
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
      '@id': `${SITE_URL}/#organization`,
      name: siteName,
      url: SITE_URL,
      logo: `${SITE_URL}/logos/will_logo.png`,
      description: defaultDescription,
      sameAs: [
        'https://www.instagram.com/lupfr_/',
        'https://www.tiktok.com/@lupfer_entertainment',
        'https://www.youtube.com/channel/UCHuxbMyxPTeQn29q32lXOew',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: siteName,
      description: defaultDescription,
      publisher: { '@id': `${SITE_URL}/#organization` },
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
      <body className="font-sans antialiased bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LiquidMetalCanvas />
          <div className="lupfr-site-content">
            <PrefetchHomeRoute />
            <EscapeBack />
            {children}
            <CookieConsent />
            <PhoneListPopup />
            <Toaster />
          </div>
        </ThemeProvider>
        <DeferredAnalytics />
      </body>
    </html>
  )
}
