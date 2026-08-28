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
 * All six photos (2026-08-28) are the owner's actual selections from the design
 * canvas ("LUPFR Website Design v2.zip" → LUPFR Restructure.dc.html's `heroPhotos`
 * array), re-encoded from the canvas's own high-resolution originals — not stand-ins
 * from the site's existing photo library. "seaside-step-repeat" is a real SEA//SIDE
 * step-and-repeat photo (assets/hero-ideas/slat-seaside-step.jpg in the canvas), so
 * despite the id name it is not a placeholder.
 */
export type HeroFilmstripPhoto = {
  id: string
  src: string
  alt: string
}

export const HERO_FILMSTRIP_PHOTOS: readonly HeroFilmstripPhoto[] = [
  { id: "neon-dj", src: "/hero/hero-slat-neon-dj.webp", alt: "DJ performing under warm stage lighting as a hand shoots up from the crowd" },
  { id: "crowd", src: "/hero/hero-slat-crowd.webp", alt: "Crowd dancing around the DJ booth on a yacht" },
  { id: "masquerade", src: "/hero/hero-slat-masquerade.webp", alt: "Two guests in masquerade makeup and lace masks" },
  { id: "band", src: "/hero/hero-slat-band.webp", alt: "Live band performing with the city skyline behind them" },
  { id: "sunset-deck", src: "/hero/hero-slat-sunset-deck.webp", alt: "Golden-hour crowd on a yacht deck" },
  { id: "seaside-step-repeat", src: "/hero/hero-slat-seaside-step.webp", alt: "SEA//SIDE guests at the step-and-repeat" },
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
