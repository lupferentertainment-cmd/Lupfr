"use client"

import Link from "next/link"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { PosterTile } from "@/components/poster-tile"
import { ShimmerImage } from "@/components/shimmer-image"
import {
  brandPath,
  brandPlainTitle,
  getBrandsByDivision,
  PLATFORM_PROGRAMS,
  type BrandItem,
} from "@/lib/data/brands"
import { cn } from "@/lib/utils"

const { liveEvents, corporateMedia } = getBrandsByDivision()
const orderedBrands: BrandItem[] = [...liveEvents, ...corporateMedia]

/**
 * Division rule-bar colors for the Operating tab (owner correction,
 * 2026-09-02, from a design-file reference screenshot: "LIVE // EVENTS" in
 * blue, "CORPORATE // MEDIA" in gold). Live/Events reuses its lead brand
 * SEA//SIDE's own `accent`; Corporate/Media spans two differently-accented
 * brands (HIGH//RISE orange, SOUND//CHECK gold) so it uses the site's own
 * standard gold accent token instead of picking one of the two.
 */
const DIVISION_ACCENTS = {
  liveEvents: liveEvents[0].accent,
  corporateMedia: "var(--accent)",
}

type BrandsTab = "operating" | "platform"

/**
 * OPERATING / PLATFORM tab switch (owner design-file punch list, 2026-09-02:
 * "Ported 2C: OPERATING / PLATFORM tab switch" from "Our Brands Ideas.dc.html"'s
 * "2C · TABBED" exploration) — a single rounded-pill control matching that
 * source's own two-button markup, restyled onto the site's own tokens instead
 * of the design file's literal hex values.
 */
function TabSwitch({ tab, onChange }: { tab: BrandsTab; onChange: (tab: BrandsTab) => void }) {
  return (
    <div
      role="group"
      aria-label="Show operating brands or platform programs"
      className="inline-flex shrink-0 overflow-hidden rounded-full border border-border"
    >
      {(
        [
          ["operating", "Operating"],
          ["platform", "Platform"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={tab === value}
          className={cn(
            "px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-200 ease-snap sm:px-5",
            tab === value
              ? "bg-accent text-accent-foreground"
              : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/**
 * PLATFORM tab card — photo-backed treatment (owner correction, 2026-09-02:
 * "see how we have pics and captions for each section of the platform"),
 * matching the same bottom-gradient/caption language as PosterTile's brand
 * cards instead of the earlier flat bordered panel.
 */
function PlatformTile({ program, index }: { program: (typeof PLATFORM_PROGRAMS)[number]; index: number }) {
  return (
    <div
      className="relative aspect-[3/4] overflow-hidden rounded-sm border border-accent/30 bg-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <ShimmerImage
        src={program.image}
        alt=""
        fill
        sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(8,7,6,0.92) 30%, rgba(8,7,6,0.25) 65%, rgba(8,7,6,0.5))",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
        <span className="font-mono text-[10.5px] text-accent">{program.num}</span>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-condensed text-xl font-bold uppercase leading-[0.95] text-white sm:text-2xl">
            {program.name}
          </h3>
          <p className="text-[12.5px] leading-relaxed text-white/75">{program.line}</p>
        </div>
      </div>
    </div>
  )
}

export function Brands() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })
  const [tab, setTab] = useState<BrandsTab>("operating")

  return (
    <section id="brands" ref={ref} className="lupfr-section-pad px-4 sm:px-6 lg:px-12">
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-[1400px]">
        <div className="mb-10 sm:mb-12 md:mb-14">
          <p className="lupfr-section-kicker mb-4">The Portfolio · Five Series</p>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2>
              <GoldShineText scrollTargetRef={ref}>Our Brands</GoldShineText>
            </h2>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <TabSwitch tab={tab} onChange={setTab} />
              <Link
                href="/brands"
                className="inline-block whitespace-nowrap border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-foreground"
              >
                View all brands →
              </Link>
            </div>
          </div>
        </div>

        {tab === "operating" ? (
          <>
            {/* Division rule bar (owner correction, 2026-09-02, with a design-file
                reference screenshot: cards render as a single flat row — "these
                should not be rows. It should be on one row" — but the Live/Events
                vs Corporate/Media grouping is still called out, as a colored
                label + rule bar *above* the row rather than a `col-span-full`
                heading that would force a second row. Proportioned 3:2 to match
                the 3 Live/Events + 2 Corporate/Media card count, so it lines up
                with the card row at the `xl:grid-cols-5` single-row breakpoint. */}
            <div className="mb-3 flex items-center gap-4 sm:mb-4">
              <div className="flex min-w-0 items-center gap-2.5" style={{ flex: 3 }}>
                <span
                  data-testid="division-label-live-events"
                  className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: DIVISION_ACCENTS.liveEvents }}
                >
                  Live <span aria-hidden>{"//"}</span> Events
                </span>
                <span className="h-px flex-1" style={{ backgroundColor: DIVISION_ACCENTS.liveEvents }} aria-hidden />
              </div>
              <div className="flex min-w-0 items-center gap-2.5" style={{ flex: 2 }}>
                <span
                  data-testid="division-label-corporate-media"
                  className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: DIVISION_ACCENTS.corporateMedia }}
                >
                  Corporate <span aria-hidden>{"//"}</span> Media
                </span>
                <span
                  className="h-px flex-1"
                  style={{ backgroundColor: DIVISION_ACCENTS.corporateMedia }}
                  aria-hidden
                />
              </div>
            </div>

            {/* The existing PosterTile poster grid, unchanged card design
                (BrandSlashText white names + each brand's own accent "//", not
                the design file's logo-image lockup names — owner explicitly
                said to keep this treatment: "reverted to white text names with
                colored //"). Renders as a single flat row of five cards — no
                `col-span-full` division heading inside the grid itself, so
                nothing forces a row break here. */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px] xl:grid-cols-5">
              {orderedBrands.map((brand, i) => (
                <PosterTile
                  key={brand.key}
                  href={brandPath(brand)}
                  ariaLabel={`View ${brandPlainTitle(brand)} brand`}
                  image={brand.image}
                  accent={brand.accent}
                  tagLabel={brand.tag}
                  index={i}
                  title={<BrandSlashText text={brand.title} color={brand.accent} />}
                  description={brand.description}
                  ctaLabel="Explore"
                  isInView={isInView}
                />
              ))}
            </div>
          </>
        ) : (
          /* Platform tab: 5 company-wide programs from the design file's real
             data, each with its own real photo (lib/data/brands.ts's
             PLATFORM_PROGRAMS). */
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:gap-[18px] xl:grid-cols-5">
            {PLATFORM_PROGRAMS.map((program, i) => (
              <PlatformTile key={program.num} program={program} index={i} />
            ))}
          </div>
        )}
      </ScrollReveal>
    </section>
  )
}
