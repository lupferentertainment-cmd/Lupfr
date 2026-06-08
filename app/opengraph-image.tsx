import { ImageResponse } from 'next/og'
import { OgBrandPreview, readLogoDataUri } from '@/lib/og-brand-preview'

export const runtime = 'nodejs'

const defaultTitle = 'LUPFR Entertainment | SF & LA Music Events & Talent Curation'
const tagline =
  "California's premier music event production — boat parties, rooftop events, warehouse sessions, and unforgettable experiences across SF & LA."

export const alt = defaultTitle
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const logoSrc = await readLogoDataUri()
  return new ImageResponse(<OgBrandPreview logoSrc={logoSrc} tagline={tagline} />, {
    ...size,
  })
}
