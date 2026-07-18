import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BrandSlashText } from "@/components/brand-slash-text"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ShimmerImage } from "@/components/shimmer-image"
import { TextReveal } from "@/components/text-reveal"
import { getServiceBySlug, getServices, servicePath, serviceSlug } from "@/lib/data/services"
import { CONTACT_PAGE_PATH, SITE_URL } from "@/lib/site"

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: serviceSlug(service.title) }))
}

export const dynamicParams = false

type ServicePageParams = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ServicePageParams): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Services",
    }
  }
  const pageTitle = `${service.title} — Services`
  const url = `${SITE_URL}/services/${slug}`
  const imageUrl = service.image ? `${SITE_URL}${service.image}` : undefined
  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description: service.description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description: service.description,
      type: "website",
      url,
      images: imageUrl ? [{ url: imageUrl, alt: `${service.title} by LUPFR Entertainment` }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: pageTitle,
      description: service.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function ServiceDetailPage({ params }: ServicePageParams) {
  const { slug } = await params
  const services = getServices()
  const index = services.findIndex((s) => serviceSlug(s.title) === slug)
  if (index === -1) notFound()

  const service = services[index]
  const numeral = String(index + 1).padStart(2, "0")
  const prev = services[(index + services.length - 1) % services.length]
  const next = services[(index + 1) % services.length]

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <Link
            href="/services"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden />
            All Services
          </Link>

          <div className="mb-4 flex items-center gap-3">
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-secondary text-accent"
              aria-hidden
            >
              <service.icon size={18} />
            </span>
            <p className="lupfr-section-kicker">What We Do — Service {numeral}</p>
          </div>
          <GoldShineText as="h1" className="mb-8 sm:mb-12">
            {service.title}
          </GoldShineText>

          <ScrollReveal variant="up" amountIn={0.05} className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
              {service.image ? (
                <ShimmerImage
                  src={service.image}
                  alt={`${service.title} by LUPFR Entertainment`}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  loading="eager"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-black/55" aria-hidden />
              <span
                className="absolute bottom-4 left-4 font-condensed text-5xl font-extrabold leading-none text-white/40"
                aria-hidden
              >
                {numeral}
              </span>
            </div>

            <div>
              <TextReveal
                text={service.description}
                amount={0.3}
                className="mb-5 max-w-[480px] text-base leading-7 text-muted-foreground sm:text-[17px]"
              />
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-accent" aria-hidden>—</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {service.relatedBrands.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {service.relatedBrands.map((brand) => (
                    <span
                      key={brand.key}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]"
                      style={{ borderColor: brand.accent, color: brand.accent }}
                    >
                      <span
                        className="h-[6px] w-[6px] shrink-0 rounded-full"
                        style={{ backgroundColor: brand.accent }}
                        aria-hidden
                      />
                      <BrandSlashText text={brand.title} />
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-8">
                <Link
                  href={CONTACT_PAGE_PATH}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-4 font-semibold tracking-normal btn-metallic-gold"
                >
                  Book This Service
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <nav
            aria-label="More services"
            className="mt-14 flex items-center justify-between gap-4 border-t border-border pt-8"
          >
            <Link
              href={servicePath(prev)}
              aria-label={`Previous service: ${prev.title}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} aria-hidden />
              {prev.title}
            </Link>
            <Link
              href={servicePath(next)}
              aria-label={`Next service: ${next.title}`}
              className="inline-flex items-center gap-2 text-right text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              {next.title}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
      <Footer />
    </main>
  )
}
