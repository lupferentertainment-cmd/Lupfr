"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
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

/**
 * The bottom-left brand lockup (owner design-file punch list, 2026-08-29:
 * "fix the LUPFR Entertainment text (and remove the LE) how we have it on the
 * new design claude file"). Matches LUPFR_Restructure.dc.html's hero `<h1>`
 * exactly: a single line reading "LUPFR Entertainment" — no separate LE mark
 * image beside it (the 2026-08-28 restructure had briefly paired the wordmark
 * with an LE logo and stacked "Entertainment" on its own line underneath;
 * both are retired here), plain foreground "LUPFR" plus gold "Entertainment"
 * in the same weight/size family, same line. The LE mark itself isn't
 * deleted — it's still used as a watermark on the Brands page and Team page,
 * just no longer here. Shared by both the desktop and mobile hero shells.
 */
export const HeroBrandLockup = memo(function HeroBrandLockup() {
  return (
    <h1 className="font-condensed hero-title-lupfr font-extrabold uppercase tracking-normal leading-[0.95] flex flex-wrap items-baseline gap-x-3">
      <span className="text-foreground">LUPFR</span>
      <span className="font-medium text-gold-accent tracking-[0.02em]">Entertainment</span>
    </h1>
  )
})

/**
 * Manual prev/next controls for the hero filmstrip (owner design-file punch
 * list, 2026-08-29: "make ability for me to scroll through images manually
 * too (both desktop and mobile)"). Desktop already lets a hover/click/focus
 * on any of the six slats jump straight to it, and mobile already has
 * tap-dots — this adds an explicit, discoverable prev/next affordance on top
 * of both, wired to each shell's existing activeIndex state (no new state
 * model). Visual language matches the site's other carousel arrows
 * (events.tsx's CAROUSEL_ARROW_CLASS), adapted for sitting over a photo
 * instead of a card background.
 */
export function HeroFilmstripArrows({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const count = HERO_FILMSTRIP_PHOTOS.length
  const goPrev = () => onSelect((activeIndex - 1 + count) % count)
  const goNext = () => onSelect((activeIndex + 1) % count)

  return (
    <>
      <button
        type="button"
        onClick={goPrev}
        aria-label="Show previous hero photo"
        className="hero-filmstrip-arrow absolute left-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow backdrop-blur-sm transition-all duration-200 hover:border-accent/60 hover:bg-black/55 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:left-5 sm:size-11"
      >
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Show next hero photo"
        className="hero-filmstrip-arrow absolute right-3 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow backdrop-blur-sm transition-all duration-200 hover:border-accent/60 hover:bg-black/55 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:right-5 sm:size-11"
      >
        <ArrowRight className="size-5" aria-hidden />
      </button>
    </>
  )
}

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
