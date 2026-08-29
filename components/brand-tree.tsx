"use client"

import { BrandSlashText } from "@/components/brand-slash-text"
import { type BrandItem } from "@/lib/data/brands"

/**
 * Corporate-structure tree (owner restructure note, 2026-08-28: "Design the
 * corporate tree page exactly as in Claude file," with reference
 * screenshots) — LUPFR at the top, two groups below: LIVE / EVENTS
 * (SEA//SIDE, IN//SIDE, OUT//SIDE) and CORPORATE · MEDIA / PROGRAMMING
 * (HIGH//RISE, SOUND//CHECK), each brand tappable to jump straight to its
 * existing detail row further down the page. The LE monogram watermark
 * behind this section was already shipped (owner note, 2026-08-08).
 */
const LIVE_EVENTS_KEYS = ["seaside", "inside", "outside"]
const CORPORATE_MEDIA_KEYS = ["highrise", "soundcheck"]

function scrollToBrand(key: string): void {
  const el = document.getElementById(`brand-${key}`)
  if (el) el.scrollIntoView({ block: "start", behavior: "smooth" })
}

function BrandTreeNode({ brand }: { brand: BrandItem }) {
  return (
    <button
      type="button"
      onClick={() => scrollToBrand(brand.key)}
      aria-label={`Jump to ${brand.title.replace(/\/\//g, " ")}`}
      className="group flex flex-1 flex-col items-center gap-1 rounded-sm border border-border bg-card px-4 py-3 text-center transition-colors hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5 sm:py-4"
    >
      <span className="font-condensed text-base font-extrabold uppercase tracking-tight text-foreground sm:text-lg">
        <BrandSlashText text={brand.title} color={brand.accent} />
      </span>
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: brand.comingSoon ? "var(--muted-foreground)" : brand.accent }}
          aria-hidden
        />
        {brand.comingSoon ? "Soon" : "Active"}
      </span>
    </button>
  )
}

export function BrandTree({ brands }: { brands: BrandItem[] }) {
  const byKey = new Map(brands.map((b) => [b.key, b]))
  const liveEvents = LIVE_EVENTS_KEYS.map((k) => byKey.get(k)).filter((b): b is BrandItem => !!b)
  const corporateMedia = CORPORATE_MEDIA_KEYS.map((k) => byKey.get(k)).filter((b): b is BrandItem => !!b)

  return (
    <div className="relative mb-10 overflow-hidden rounded-sm border border-border bg-card/60 px-4 py-8 sm:mb-14 sm:px-8 sm:py-10">
      <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-8">
        Corporate Structure · Tap a brand to explore
      </p>

      <div className="mx-auto mb-8 w-fit rounded-sm px-6 py-3 text-center btn-metallic-gold sm:mb-10">
        <span className="block font-condensed text-xl font-extrabold uppercase tracking-tight sm:text-2xl">LUPFR</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.16em] opacity-80">
          Entertainment · Est. 2025
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
        <div className="flex flex-col gap-3 rounded-sm border border-border/60 p-4 sm:p-5">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Live <span className="text-foreground/50">/ Events</span>
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {liveEvents.map((brand) => (
              <BrandTreeNode key={brand.key} brand={brand} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-sm border border-border/60 p-4 sm:p-5">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Corporate · Media <span className="text-foreground/50">/ Programming</span>
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {corporateMedia.map((brand) => (
              <BrandTreeNode key={brand.key} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
