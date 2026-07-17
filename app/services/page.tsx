import type { Metadata } from "next"
import { BrandSlashText } from "@/components/brand-slash-text"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { ShimmerImage } from "@/components/shimmer-image"
import Link from "next/link"
import { getServices, servicePath, serviceSlug } from "@/lib/data/services"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Services",
  description:
    "Explore LUPFR Entertainment services for owned events, talent booking, venue programming, private events, production, and brand partnerships.",
  alternates: { canonical: `${SITE_URL}/services` },
}

export default function ServicesPage() {
  const services = getServices()

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <p className="lupfr-section-kicker mb-4">What We Do</p>
          <GoldShineText as="h1" className="mb-8 sm:mb-12">
            Our Services
          </GoldShineText>

          {services.map((service, index) => {
            const numeral = String(index + 1).padStart(2, "0")
            const imageFirst = index % 2 === 0

            return (
              <section
                id={serviceSlug(service.title)}
                key={service.title}
                className="grid scroll-mt-28 gap-8 border-b border-border py-10 sm:py-14 md:grid-cols-2 md:items-center md:gap-14"
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-muted ${
                    imageFirst ? "md:order-1" : "md:order-2"
                  }`}
                >
                  {service.image ? (
                    <ShimmerImage
                      src={service.image}
                      alt={`${service.title} by LUPFR Entertainment`}
                      fill
                      sizes="(max-width: 768px) 100vw, 550px"
                      loading={index < 2 ? "eager" : "lazy"}
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

                <div className={imageFirst ? "md:order-2" : "md:order-1"}>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
                    Service {numeral}
                  </p>
                  <h2 className="mb-4 font-condensed text-3xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-4xl">
                    <Link
                      href={servicePath(service)}
                      className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {service.title}
                    </Link>
                  </h2>
                  <p className="mb-5 max-w-[480px] text-base leading-7 text-muted-foreground sm:text-[17px]">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="text-accent" aria-hidden>—</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={servicePath(service)}
                    aria-label={`Learn more about ${service.title}`}
                    className="mt-5 inline-block text-sm text-accent underline-offset-4 transition-colors hover:underline"
                  >
                    Learn more →
                  </Link>
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
                </div>
              </section>
            )
          })}
        </div>
      </div>
      <Footer />
    </main>
  )
}
