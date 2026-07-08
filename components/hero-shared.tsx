"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { memo, useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"

/** Shared hero copy rotation (mounted in parent for phrase interval). */
export const HERO_PHRASES = [
  "Redefining the Music Experience",
]

export const PHRASE_DURATION_MS = 4500
export const PHRASE_DURATION_MOBILE_MS = 9000

export const FADE_DURATION_S = 0.6

export const HERO_POSTER_DARK = "/hero/hero-poster-dark.webp"
export const HERO_POSTER_LIGHT = "/hero/hero-poster-light.webp"
export const HERO_POSTER = HERO_POSTER_DARK

/**
 * Mobile-only hero posters: purpose-built ~1080px, aggressively compressed
 * (<90KB) so the phone LCP loads a tiny source instead of the 2560px / ~700KB
 * desktop posters (whose on-demand AVIF re-encode of a huge source was the main
 * cause of the slow mobile hero paint). Desktop keeps the full posters + video.
 */
export const HERO_POSTER_DARK_MOBILE = "/hero/hero-poster-dark-mobile.webp"
export const HERO_POSTER_LIGHT_MOBILE = "/hero/hero-poster-light-mobile.webp"

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

/** Mobile: no scroll-linked MotionValues — static Entertainment gradient. */
export const HeroTitleContentMobile = memo(function HeroTitleContentMobile({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null
}) {
  return (
    <h1
      className="font-serif hero-title-lupfr font-bold tracking-tighter leading-none text-center flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3"
    >
      <HeroLupfrText prefersReducedMotion={prefersReducedMotion} />
      <span
        className="block hero-title-entertainment font-medium hero-entertainment-text normal-case tracking-normal"
      >
        Entertainment
      </span>
    </h1>
  )
})

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
