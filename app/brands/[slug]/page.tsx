import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BrandSlashText } from "@/components/brand-slash-text"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { ShimmerImage } from "@/components/shimmer-image"
import { brandPath, brandPlainTitle, getBrandBySlug, getBrands } from "@/lib/data/brands"
import { eventDetailPath, getPastEvents, getUpcomingEvents } from "@/lib/events"
import { CONTACT_PAGE_PATH, SITE_URL } from "@/lib/site"

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

export default async function BrandDetailPage({ params }: BrandPageParams) {
  const { slug } = await params
  const brands = getBrands()
  const index = brands.findIndex((b) => b.key === slug)
  if (index === -1) notFound()

  const brand = brands[index]
  const prev = brands[(index + brands.length - 1) % brands.length]
  const next = brands[(index + 1) % brands.length]

  const upcoming = brand.comingSoon ? [] : getUpcomingEvents().filter((e) => e.brandTag === brand.title)
  const past = brand.comingSoon ? [] : getPastEvents().filter((e) => e.brandTag === brand.title)

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <Link
            href="/brands"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden />
            All Brands
          </Link>

          <span
            className="mb-4 inline-flex w-fit items-center rounded-xs border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{ borderColor: brand.accent, color: brand.accent }}
          >
            {brand.tag}
          </span>
          <h1 className="mb-8 sm:mb-12">
            <BrandSlashText text={brand.title} color={brand.accent} />
          </h1>

          <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted sm:rounded-md">
              {brand.image ? (
                <ShimmerImage
                  src={brand.image}
                  alt={`${brandPlainTitle(brand)} by LUPFR Entertainment`}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  loading="eager"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/55" aria-hidden />
            </div>

            <div>
              <p className="mb-5 max-w-[480px] text-base leading-7 text-muted-foreground sm:text-[17px]">
                {brand.description}
              </p>
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                {brand.format}
              </p>

              {brand.gallery && brand.gallery.length > 0 ? (
                <div className="mb-6 grid grid-cols-3 gap-2.5">
                  {brand.gallery.map((src) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-sm sm:rounded-md">
                      <ShimmerImage src={src} alt="" fill sizes="(max-width: 768px) 33vw, 180px" className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}

              {brand.externalUrl ? (
                <a
                  href={brand.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 inline-block text-sm text-accent underline-offset-4 transition-colors hover:underline"
                >
                  Visit {brand.externalUrl.replace(/^https?:\/\//, "")} ↗
                </a>
              ) : null}

              {brand.comingSoon ? (
                <div className="rounded-sm border border-border py-10 text-center sm:rounded-md">
                  <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">Coming soon</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Upcoming
                    </p>
                    {upcoming.length > 0 ? (
                      <ul className="space-y-1">
                        {upcoming.map((event) => (
                          <li key={event.id}>
                            <Link
                              href={eventDetailPath(event.slug)}
                              className="block border-b border-border py-2 text-sm text-foreground transition-colors hover:text-accent"
                            >
                              {event.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Past highlights
                    </p>
                    {past.length > 0 ? (
                      <ul className="space-y-1">
                        {past.map((event) => (
                          <li key={event.id}>
                            <Link
                              href={eventDetailPath(event.slug)}
                              className="block border-b border-border py-2 text-sm text-foreground transition-colors hover:text-accent"
                            >
                              {event.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No past highlights yet.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <Link
                  href={CONTACT_PAGE_PATH}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-4 font-semibold tracking-normal btn-metallic-gold"
                >
                  Book This Brand
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          <nav
            aria-label="More brands"
            className="mt-14 flex items-center justify-between gap-4 border-t border-border pt-8"
          >
            <Link
              href={brandPath(prev)}
              aria-label={`Previous brand: ${brandPlainTitle(prev)}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} aria-hidden />
              {brandPlainTitle(prev)}
            </Link>
            <Link
              href={brandPath(next)}
              aria-label={`Next brand: ${brandPlainTitle(next)}`}
              className="inline-flex items-center gap-2 text-right text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              {brandPlainTitle(next)}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
      <Footer />
    </main>
  )
}
