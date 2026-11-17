import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BrandLanding } from "@/components/brand-landing"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { brandPlainTitle, getBrandBySlug, getBrands } from "@/lib/data/brands"
import { SITE_URL } from "@/lib/site"

export function generateStaticParams() {
  return getBrands().map((brand) => ({ slug: brand.key }))
}

export const dynamicParams = false

type BrandPageParams = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: BrandPageParams): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Brands",
    }
  }
  const plainTitle = brandPlainTitle(brand)
  const pageTitle = `${plainTitle} — Brands`
  const url = `${SITE_URL}/brands/${slug}`
  const imageUrl = brand.image ? `${SITE_URL}${brand.image}` : undefined
  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description: brand.description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description: brand.description,
      type: "website",
      url,
      images: imageUrl ? [{ url: imageUrl, alt: `${plainTitle} by LUPFR Entertainment` }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: pageTitle,
      description: brand.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

/**
 * Brand landing page (LUPFR Website Design v16): replaces the old two-column
 * detail layout with the design's full-screen hero → THE FORMAT → calendar →
 * gallery → plan box → more-brands landing (see components/brand-landing.tsx).
 */
export default async function BrandDetailPage({ params }: BrandPageParams) {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) notFound()

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <BrandLanding brand={brand} />
      <Footer />
    </main>
  )
}
