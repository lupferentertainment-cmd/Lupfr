"use client"

import Link from "next/link"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { PosterTile } from "@/components/poster-tile"
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

function DivisionLabel({ children }: { children: string }) {
  return (
    <p className="col-span-full mb-1 mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground first:mt-0">
      {children}
    </p>
  )
}

/**
 * PLATFORM tab card — from the design file's own flat bordered-panel style
 * (no background photo in that source for these five cards; see
 * lib/data/brands.ts's PLATFORM_PROGRAMS doc comment).
 */
function PlatformTile({ program, index }: { program: (typeof PLATFORM_PROGRAMS)[number]; index: number }) {
  return (
    <div
      className="flex aspect-[3/4] flex-col justify-between rounded-sm border border-accent/30 bg-accent/5 p-4 sm:p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="font-mono text-[10.5px] text-accent">{program.num}</span>
      <div className="flex flex-col gap-2.5">
        <h3 className="font-condensed text-xl font-bold uppercase leading-[0.95] text-foreground sm:text-2xl">
          {program.name}
        </h3>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">{program.line}</p>
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
          /* Operating tab: the existing PosterTile poster grid, unchanged card
             design (BrandSlashText white names + each brand's own accent "//",
             not the design file's logo-image lockup names — owner explicitly
             said to keep this treatment: "reverted to white text names with
             colored //"). Division dividers group the cards into LIVE/EVENTS
             and CORPORATE/MEDIA, the same split + copy as the corporate
             structure tree (components/brand-tree.tsx) rather than a second,
             differently-worded grouping concept. */
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px] xl:grid-cols-5">
            <DivisionLabel>Live · Events</DivisionLabel>
            {liveEvents.map((brand) => {
              const i = orderedBrands.indexOf(brand)
              return (
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
              )
            })}
            <DivisionLabel>Corporate · Media</DivisionLabel>
            {corporateMedia.map((brand) => {
              const i = orderedBrands.indexOf(brand)
              return (
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
              )
            })}
          </div>
        ) : (
          /* Platform tab: 5 company-wide programs from the design file's real
             data (lib/data/brands.ts's PLATFORM_PROGRAMS) — no background
             photos, since none were supplied for these cards in that source. */
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
