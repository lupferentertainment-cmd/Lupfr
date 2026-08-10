import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { BrandDeck } from "@/components/brand-deck"
import { BrandSlashText } from "@/components/brand-slash-text"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ShimmerImage } from "@/components/shimmer-image"
import { brandPath, brandPlainTitle, getBrands, LUPFR_DECK, type BrandItem } from "@/lib/data/brands"
import { eventDetailPath, getPastEvents, getUpcomingEvents } from "@/lib/events"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Brands",
  description:
    "Explore the LUPFR Entertainment portfolio — SEA//SIDE, HIGH//RISE, SOUND//CHECK, IN//SIDE, and OUT//SIDE.",
  alternates: { canonical: `${SITE_URL}/brands` },
}

function BrandOverviewRow({ brand, index }: { brand: BrandItem; index: number }) {
  const panelFirst = index % 2 === 0
  const upcoming = brand.comingSoon ? [] : getUpcomingEvents().filter((e) => e.brandTag === brand.title)
  const past = brand.comingSoon ? [] : getPastEvents().filter((e) => e.brandTag === brand.title)

  return (
    <section className="border-b border-border py-10 sm:py-14">
      <ScrollReveal
        variant="up"
        amountIn={0.1}
        className="grid gap-8 md:grid-cols-2 md:items-stretch md:gap-14"
      >
      <div
        className={`relative flex min-h-[260px] flex-col justify-center overflow-hidden rounded-sm border border-border p-8 sm:rounded-md sm:p-10 ${
          panelFirst ? "md:order-1" : "md:order-2"
        }`}
      >
        {brand.image ? (
          <ShimmerImage
            src={brand.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            loading={index === 0 ? "eager" : "lazy"}
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/65 to-black/30" aria-hidden />
        <span
          className="relative mb-5 inline-flex w-fit items-center rounded-xs border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em]"
          style={{ borderColor: brand.accent, color: brand.accent }}
        >
          {brand.tag}
        </span>
        <h2 className="relative font-condensed text-4xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-5xl">
          <Link
            href={brandPath(brand)}
            aria-label={`View ${brandPlainTitle(brand)} brand`}
            className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <BrandSlashText text={brand.title} color={brand.accent} />
          </Link>
        </h2>
        <p className="relative mt-4 font-mono text-[11px] tracking-[0.05em] text-white/60">{brand.format}</p>
        {brand.externalUrl ? (
          <a
            href={brand.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-4 w-fit text-sm text-white/70 transition-colors hover:text-white hover:underline"
          >
            {brand.externalUrl.replace(/^https?:\/\//, "")} ↗
          </a>
        ) : null}
      </div>

      <div className={`flex flex-col justify-center gap-6 ${panelFirst ? "md:order-2" : "md:order-1"}`}>
        <p className="text-base leading-7 text-muted-foreground sm:text-[17px]">{brand.description}</p>

        {brand.gallery && brand.gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            {brand.gallery.slice(0, 3).map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-sm sm:rounded-md">
                <ShimmerImage src={src} alt="" fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        {brand.comingSoon ? (
          <div className="py-8 text-center">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">Coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Upcoming</p>
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
      </div>
      </ScrollReveal>
    </section>
  )
}

export default function BrandsPage() {
  const brands = getBrands()

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="relative px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        {/*
          LE monogram watermark behind the portfolio (owner note 2026-08-08:
          "dont miss the LE logo in background of the corp structure"), ported
          from the design file's corporate-tree treatment — centred, ~4.5%
          opacity, faintly blurred. Purely decorative: `aria-hidden` and
          `pointer-events-none` keep it out of the a11y tree and off every
          click target. `select-none` stops it being caught by drag-select.
        */}
        <Image
          src="/images/le-logo.webp"
          alt=""
          aria-hidden
          width={1100}
          height={1100}
          priority={false}
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(110%,1100px)] max-w-none -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.045] blur-[0.5px]"
        />
        <div className="relative mx-auto max-w-[1400px]">
          <p className="lupfr-section-kicker mb-4">The Portfolio · Five Series</p>
          <GoldShineText as="h1" className="mb-6">
            Our Brands
          </GoldShineText>

          {/* The parent portfolio deck — one brand, five worlds. */}
          <div className="mb-10 sm:mb-14">
            <BrandDeck slides={LUPFR_DECK} label="LUPFR" />
          </div>

          {brands.map((brand, index) => (
            <BrandOverviewRow key={brand.key} brand={brand} index={index} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
