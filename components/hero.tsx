"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { HeroMobileStaticSection } from "@/components/hero-mobile-static"
import {
  HeroLiteOrbs,
  HERO_PHRASES,
  PHRASE_DURATION_MOBILE_MS,
  PHRASE_DURATION_MS,
} from "@/components/hero-shared"
import { useClientPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useIsLowComputeDevice, useIsMobile } from "@/hooks/use-mobile"

const HeroDesktopViewport = dynamic(() => import("@/components/hero-desktop"), {
  ssr: true,
})

/**
 * Mobile/small-tablet (`useIsMobile() !== false`): poster hero + static lite orbs (`HeroLiteOrbs` variant
 * mobile does not load the heavier desktop `<HeroDesktopViewport>` chunk (dual MP4s, Motion orb loops,
 * `useScroll` parallax, scroll-linked line shine).
 *
 * Laptop/desktop (`useIsMobile() === false`): loads `HeroDesktopViewport` asynchronously after the client
 * knows viewport width — mobile visitors avoid parsing/downloading desktop-only hero code paths.
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotionRaw = useClientPrefersReducedMotion()
  const prefersReducedMotion = mounted ? prefersReducedMotionRaw : null
  const isMobile = useIsMobile()
  const isLowCompute = useIsLowComputeDevice()
  /** Strict `false` only — laptop/desktop keeps the rich hero; do not use truthiness here. */
  const isDesktopViewport = isMobile === false
  const shouldUseDesktopHero = isDesktopViewport && isLowCompute !== true
  const liteHero = prefersReducedMotion === true || !shouldUseDesktopHero
  const phraseDurationMs = shouldUseDesktopHero ? PHRASE_DURATION_MS : PHRASE_DURATION_MOBILE_MS
  const reducePhraseMotion = prefersReducedMotion === true

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length)
    }, phraseDurationMs)
    return () => clearInterval(id)
  }, [phraseDurationMs])

  return (
    <section
      ref={containerRef}
      className="lupfr-hero relative min-h-[100vh] min-h-[100dvh] overflow-hidden"
    >
      {shouldUseDesktopHero ? (
        <HeroDesktopViewport
          containerRef={containerRef}
          liteHero={liteHero}
          prefersReducedMotion={prefersReducedMotion}
          phraseIndex={phraseIndex}
          reducePhraseMotion={reducePhraseMotion}
        />
      ) : (
        <>
          <HeroLiteOrbs variant="mobile" />
          <HeroMobileStaticSection
            prefersReducedMotion={prefersReducedMotion}
            phraseIndex={phraseIndex}
            reducePhraseMotion={reducePhraseMotion}
          />
        </>
      )}
    </section>
  )
}
