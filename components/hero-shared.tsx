"use client"

import Image from "next/image"
import { memo } from "react"

/** Shared hero copy rotation (mounted in parent for phrase interval). */
export const HERO_PHRASES = [
  "Redefining the Music Experience",
]

export const PHRASE_DURATION_MS = 4500
export const PHRASE_DURATION_MOBILE_MS = 9000

export const FADE_DURATION_S = 0.6

/**
 * Hero filmstrip (owner restructure, 2026-08-28): the static yacht poster/video is
 * retired in favor of six photo slats. Order is intentional (owner spec) — do not
 * resort. Desktop renders all six as vertical slats (active one widens); mobile
 * collapses to a single full-bleed carousel over the same photos + dots, never six
 * slivers. Sources are pre-sized, WebP-only copies under public/hero/ (kept small —
 * see tests/unit/hero-filmstrip-performance.test.ts) so the desktop chunk and the
 * mobile LCP slide both stay light.
 *
 * "seaside-step-repeat" is a placeholder (the reused SEA//SIDE golden-hour deck shot)
 * — the owner has not yet delivered a real SEA//SIDE step-and-repeat photo. Swap
 * `src` here the moment that lands; nothing else needs to change.
 */
export type HeroFilmstripPhoto = {
  id: string
  src: string
  alt: string
}

export const HERO_FILMSTRIP_PHOTOS: readonly HeroFilmstripPhoto[] = [
  { id: "neon-dj", src: "/hero/hero-slat-neon-dj.webp", alt: "DJ under red, blue, and green stage lights" },
  { id: "crowd", src: "/hero/hero-slat-crowd.webp", alt: "Crowd dancing in front of the DJ booth" },
  { id: "masquerade", src: "/hero/hero-slat-masquerade.webp", alt: "Masquerade portrait in gold and black" },
  { id: "band", src: "/hero/hero-slat-band.webp", alt: "Live band performing with a bay view behind them" },
  { id: "sunset-deck", src: "/hero/hero-slat-sunset-deck.webp", alt: "Golden-hour crowd on a yacht deck" },
  // TODO(owner asset): swap for the real SEA//SIDE step-and-repeat photo once delivered.
  { id: "seaside-step-repeat", src: "/hero/hero-slat-seaside-placeholder.webp", alt: "SEA//SIDE guests on a sunlit yacht deck" },
] as const

export const HERO_FILMSTRIP_INTERVAL_MS = 5000

/** LUPFR: same-size letters with a static gold shine (no animated background-position, so it never repaints/flickers over the hero media). */
export const HeroLupfrText = memo(function HeroLupfrText({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null
}) {
  const shineClass = prefersReducedMotion ? "hero-gold-shine-static" : "hero-gold-shine-stable"

  return (
    <span
      className={`inline-block overflow-visible hero-gold-shine-scroll ${shineClass}`}
    >
      LUPFR
    </span>
  )
})

/**
 * The bottom-left brand lockup (owner restructure, 2026-08-28): LE mark image beside
 * the "LUPFR / Entertainment" wordmark, replacing the old full-width centered hero
 * title. Reuses the existing `.hero-title-lupfr` / `.hero-title-entertainment`
 * treatment (now sized for a corner lockup, see app/globals.css) so the same
 * condensed/uppercase/extrabold identity carries over — just smaller and left-aligned.
 * Shared by both the desktop and mobile hero shells.
 */
export const HeroBrandLockup = memo(function HeroBrandLockup({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null
}) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Image
        src="/images/le-logo.webp"
        alt=""
        width={64}
        height={64}
        className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
        aria-hidden
      />
      <h1 className="font-condensed hero-title-lupfr font-extrabold tracking-normal leading-none flex flex-col items-start gap-0.5">
        <HeroLupfrText prefersReducedMotion={prefersReducedMotion} />
        <span className="block hero-title-entertainment font-medium uppercase tracking-normal text-foreground">
          Entertainment
        </span>
      </h1>
    </div>
  )
})

/**
 * Desktop-only decorative corner bracket + the "LOS ANGELES · SAN FRANCISCO / EST.
 * 2025" readout pinned bottom-right (owner restructure, 2026-08-28 — the coordinates
 * line is retired now that the bottom-left corner holds the brand lockup instead).
 * The matching left bracket is dropped: that corner now holds the real
 * HeroBrandLockup copy block, so a decorative bracket there would sit among live
 * content instead of framing an empty corner. Static text/border, no motion.
 */
export function HeroCornerReadout() {
  return (
    <>
      <div className="absolute bottom-6 right-6 z-[15] font-mono text-[10px] tracking-[0.1em] text-foreground/50 pointer-events-none">
        LOS ANGELES · SAN FRANCISCO / EST. 2025
      </div>
      <div
        className="absolute bottom-[120px] right-6 z-[15] h-[14px] w-[14px] border-b border-r border-accent/50 pointer-events-none"
        aria-hidden
      />
    </>
  )
}
