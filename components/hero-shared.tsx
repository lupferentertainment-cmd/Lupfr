"use client"

import Image from "next/image"
import { memo, useState } from "react"

import { cn } from "@/lib/utils"

import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"

/** Shared hero copy rotation (mounted in parent for phrase interval). */
export const HERO_PHRASES = [
  "Sound that moves you. Events that move the city.",
  "Rooftops, boats, warehouses. One vibe. One city.",
  "Curating unforgettable music experiences. Boat parties, rooftop events, and warehouse sessions that move the city.",
  "Where the Bay dances. Premier music events that define San Francisco nightlife.",
  "From boat parties to warehouses—we turn every night into an experience.",
  "San Francisco's pulse. Music, elevated.",
  "We don't just throw parties. We create moments that last.",
  "The city's most iconic music experiences—curated, produced, unforgettable.",
  "Where beats meet the Bay. Where crowds become communities.",
  "Ten years of moving dance floors. One mission: make every night matter.",
]

export const PHRASE_DURATION_MS = 4500
export const PHRASE_DURATION_MOBILE_MS = 9000

export const FADE_DURATION_S = 0.6

export const HERO_POSTER = "/hero/hero-poster.webp"

/** Remounts whenever `fallbackToImage` toggles on so poster decode state stays correct. */
export function HeroFallbackPoster() {
  const [ready, setReady] = useState(false)
  return (
    <div className="absolute inset-0">
      <SkeletonShimmerLayer show={!ready} />
      <Image
        src={HERO_POSTER}
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

/** LUPFR: same-size letters with gold shine (periodic or static). */
export const HeroLupfrText = memo(function HeroLupfrText({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null
}) {
  return (
    <span
      className={`inline-block overflow-visible hero-gold-shine-scroll gpu-accelerate ${prefersReducedMotion ? "hero-gold-shine-static" : "hero-gold-shine-periodic"}`}
    >
      LUPFR
    </span>
  )
})

const MOBILE_ENTERTAINMENT_POSITION = "50% 50%"

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
        style={{ backgroundPosition: MOBILE_ENTERTAINMENT_POSITION }}
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
