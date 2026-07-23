"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { memo, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { BrandSlashText } from "@/components/brand-slash-text"
import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"

/** Shared hero copy rotation (mounted in parent for phrase interval). */
export const HERO_PHRASES = [
  "Redefining the Music Experience",
]

export const PHRASE_DURATION_MS = 4500
export const PHRASE_DURATION_MOBILE_MS = 9000

export const FADE_DURATION_S = 0.6

/**
 * Poster = a still from the hero drone clip (phase 29) so the video's first
 * frame, its slow-network fallback, and the videoless mobile hero all show the
 * same scene. One frame serves both themes — same precedent as the video
 * itself (HERO_VIDEO_DARK === HERO_VIDEO_LIGHT); the hero's own washes handle
 * theme contrast. The prior ERIA posters stay on disk for easy revert.
 */
export const HERO_POSTER_DARK = "/hero/hero-poster-yacht.webp"
export const HERO_POSTER_LIGHT = "/hero/hero-poster-yacht.webp"
export const HERO_POSTER = HERO_POSTER_DARK

/**
 * Mobile-only hero poster: purpose-built 3:4 center crop from the yacht still,
 * sized for retina phones so LCP stays sharp. Desktop keeps the full poster +
 * immediate video; mobile may fade the same yacht MP4 in after window load.
 */
export const HERO_POSTER_DARK_MOBILE = "/hero/hero-poster-yacht-mobile.webp"
export const HERO_POSTER_LIGHT_MOBILE = "/hero/hero-poster-yacht-mobile.webp"

/** Same yacht clip for desktop + deferred mobile playback (no quality cut). */
export const HERO_VIDEO_DARK = "/hero/hero_yacht_001.mp4"
export const HERO_VIDEO_LIGHT = "/hero/hero_yacht_001.mp4"

/**
 * Theme for hero media src selection. SSR cannot know the stored theme, so the
 * server (and first client render) always resolve "dark" via the hydration
 * snapshot — avoids the next/image src hydration mismatch — then swaps to the
 * client's resolved theme after hydration.
 */
export function useHeroTheme(): "light" | "dark" {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted && resolvedTheme === "light" ? "light" : "dark"
}

/** Remounts whenever `fallbackToImage` toggles on so poster decode state stays correct. */
export function HeroFallbackPoster({ posterSrc = HERO_POSTER }: { posterSrc?: string }) {
  const [ready, setReady] = useState(false)
  return (
    <div className="absolute inset-0">
      <SkeletonShimmerLayer show={!ready} />
      <Image
        src={posterSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        onLoad={() => setReady(true)}
        className={cn(
          "relative z-[1] object-cover object-center",
          "motion-safe:transition-opacity motion-safe:duration-500 motion-reduce:transition-none",
          ready ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />
    </div>
  )
}

/** LUPFR: same-size letters with a static gold shine (no animated background-position, so it never repaints/flickers over the hero video). */
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

/** Mobile: LUPFR keeps its gold-shine gradient; Entertainment is plain condensed/uppercase (matches the comp). */
export const HeroTitleContentMobile = memo(function HeroTitleContentMobile({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null
}) {
  return (
    <h1
      className="font-condensed hero-title-lupfr font-extrabold tracking-normal leading-none text-center flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3"
    >
      <HeroLupfrText prefersReducedMotion={prefersReducedMotion} />
      <span
        className="block hero-title-entertainment font-medium uppercase tracking-normal text-foreground"
      >
        Entertainment
      </span>
    </h1>
  )
})

/**
 * Desktop-only decorative framing from the comp: a coordinates readout and
 * corner brackets pinned to the hero's bottom corners (static text/borders,
 * no motion — safe to add without touching the mobile no-video/no-loop
 * performance budget, so this is not rendered on the mobile hero).
 */
export function HeroCornerReadout() {
  return (
    <>
      <div className="absolute bottom-6 left-6 z-[15] font-mono text-[10px] tracking-[0.1em] text-foreground/50 pointer-events-none">
        <BrandSlashText text="34.1478°N // 118.1445°W" />
      </div>
      <div className="absolute bottom-6 right-6 z-[15] font-mono text-[10px] tracking-[0.1em] text-foreground/50 pointer-events-none">
        <BrandSlashText text="LA · SF // EST. 2025" />
      </div>
      <div
        className="absolute bottom-[120px] left-6 z-[15] h-[14px] w-[14px] border-t border-l border-accent/50 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-[120px] right-6 z-[15] h-[14px] w-[14px] border-b border-r border-accent/50 pointer-events-none"
        aria-hidden
      />
    </>
  )
}

export type HeroOrbVariant = "mobile" | "desktop"

/** Static blurred orbs — mobile hero and desktop reduced-motion / lite paths (lighter blurs on phone). */
export function HeroLiteOrbs({ variant }: { variant: HeroOrbVariant }) {
  const orbBlurSide =
    variant === "desktop"
      ? "blur-[100px] sm:blur-[128px]"
      : "blur-[56px] sm:blur-[72px]"
  const orbBlurCenter =
    variant === "desktop"
      ? "blur-[120px] sm:blur-[180px]"
      : "blur-[72px] sm:blur-[100px]"

  return (
    <>
      <div
        className="absolute inset-0 gpu-accelerate opacity-80 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        aria-hidden
      />
      <div
        className={cn(
          "absolute top-1/4 -left-32 w-72 h-72 sm:w-96 sm:h-96 gpu-accelerate bg-accent/22 rounded-full",
          orbBlurSide
        )}
        aria-hidden
      />
      <div
        className={cn(
          "absolute bottom-1/4 -right-32 w-72 h-72 sm:w-96 sm:h-96 gpu-accelerate bg-accent/12 rounded-full",
          orbBlurSide
        )}
        aria-hidden
      />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,480px)] h-[min(100vw,480px)] sm:w-[600px] sm:h-[600px] gpu-accelerate bg-accent/6 rounded-full opacity-90",
          orbBlurCenter
        )}
        aria-hidden
      />
    </>
  )
}
