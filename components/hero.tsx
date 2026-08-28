"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { HeroMobileStaticSection } from "@/components/hero-mobile-static"
import { HERO_PHRASES, PHRASE_DURATION_MOBILE_MS, PHRASE_DURATION_MS } from "@/components/hero-shared"
import { useClientPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useIsMobile } from "@/hooks/use-mobile"

const HeroDesktopViewport = dynamic(() => import("@/components/hero-desktop"), {
  ssr: true,
})

/**
 * Mobile/small-tablet (`useIsMobile() !== false`): the filmstrip collapses to a single
 * full-bleed photo + dots (no video, no Framer). Does not load the heavier desktop
 * `<HeroDesktopViewport>` chunk (the six-slat filmstrip + its click/auto-advance logic).
 *
 * Laptop/desktop (`useIsMobile() === false`): loads `HeroDesktopViewport` asynchronously after the client
 * knows viewport width — mobile visitors avoid desktop-only code paths.
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotionRaw = useClientPrefersReducedMotion()
  const prefersReducedMotion = mounted ? prefersReducedMotionRaw : null
  const isMobile = useIsMobile()
  /** Strict `false` only — laptop/desktop keeps the rich hero; do not use truthiness here. */
  const isDesktopViewport = isMobile === false
  const phraseDurationMs = isDesktopViewport ? PHRASE_DURATION_MS : PHRASE_DURATION_MOBILE_MS
  const reducePhraseMotion = prefersReducedMotion === true

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timeoutId)
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
      {isDesktopViewport ? (
        <HeroDesktopViewport
          containerRef={containerRef}
          prefersReducedMotion={prefersReducedMotion}
          phraseIndex={phraseIndex}
          reducePhraseMotion={reducePhraseMotion}
        />
      ) : (
        <HeroMobileStaticSection
          prefersReducedMotion={prefersReducedMotion}
          phraseIndex={phraseIndex}
          reducePhraseMotion={reducePhraseMotion}
        />
      )}
    </section>
  )
}
