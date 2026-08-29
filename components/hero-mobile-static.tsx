"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react"

import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import {
  HeroBrandLockup,
  HeroFilmstripArrows,
  HERO_FILMSTRIP_INTERVAL_MS,
  HERO_FILMSTRIP_PHOTOS,
  HERO_PHRASES,
} from "@/components/hero-shared"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import { cn } from "@/lib/utils"

type HeroMobileStaticSectionProps = {
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/**
 * Mobile (& SSR pre-breakpoint): the filmstrip collapses to a single full-bleed photo
 * with tappable dots (owner restructure, 2026-08-28 — "please don't ship six slivers
 * on phone") instead of the old HD poster + deferred yacht MP4. No Framer / video on
 * this path, matching the existing mobile-perf budget.
 */
export function HeroMobileStaticSection({
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroMobileStaticSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)
  const touchStartXRef = useRef<number | null>(null)
  const autoAdvance = prefersReducedMotion !== true

  useEffect(() => {
    if (!autoAdvance) return
    timeoutRef.current = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_FILMSTRIP_PHOTOS.length)
    }, HERO_FILMSTRIP_INTERVAL_MS)
    return () => window.clearTimeout(timeoutRef.current)
  }, [activeIndex, autoAdvance])

  const selectSlide = useCallback((index: number) => {
    setReady(false)
    setActiveIndex(index)
  }, [])

  // Swipe gesture (owner request 2026-08-29: "scroll through images manually
  // too... both desktop and mobile") — a plain touchstart/touchend delta, no
  // library, so the mobile hero stays framer-motion-free per
  // tests/unit/hero-filmstrip-performance.test.ts.
  const SWIPE_THRESHOLD_PX = 40
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null
  }, [])
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const startX = touchStartXRef.current
      touchStartXRef.current = null
      if (startX === null) return
      const endX = e.changedTouches[0]?.clientX ?? startX
      const deltaX = endX - startX
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
      const count = HERO_FILMSTRIP_PHOTOS.length
      selectSlide(deltaX < 0 ? (activeIndex + 1) % count : (activeIndex - 1 + count) % count)
    },
    [activeIndex, selectSlide]
  )

  const activePhoto = HERO_FILMSTRIP_PHOTOS[activeIndex]

  return (
    <>
      <div
        className="absolute inset-0 bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <SkeletonShimmerLayer show={!ready} />
        <Image
          key={activePhoto.src}
          src={activePhoto.src}
          alt={activePhoto.alt}
          fill
          priority={activeIndex === 0}
          fetchPriority={activeIndex === 0 ? "high" : undefined}
          sizes="100vw"
          onLoad={() => setReady(true)}
          className={cn(
            "object-cover object-center motion-safe:transition-opacity motion-safe:duration-500 motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="absolute inset-0 bg-black/25 z-[5]" aria-hidden />
        <div className="absolute inset-0 lupfr-hero-media-wash z-10" aria-hidden />

        <HeroFilmstripArrows activeIndex={activeIndex} onSelect={selectSlide} />

        <div
          className="absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 z-[15] flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="Hero photo"
        >
          {HERO_FILMSTRIP_PHOTOS.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show ${photo.alt}`}
              onClick={() => selectSlide(index)}
              className={cn(
                "h-2 rounded-full transition-[width,opacity] duration-300",
                index === activeIndex ? "w-5 bg-accent opacity-100" : "w-2 bg-white/60 opacity-80"
              )}
            />
          ))}
        </div>
      </div>

      {/* absolute inset-0 (not h-full) — see matching note in hero-desktop.tsx: the
          parent <section> only sets min-h-*, so a percentage height here doesn't
          reliably resolve and the copy block was rendering at the top instead of
          bottom-pinned. pointer-events-none (2026-08-29 owner report, "the arrows
          between slides on hero do not work") — this inset-0 wrapper's hit box
          covered the whole hero and ate clicks meant for HeroFilmstripArrows/the
          photo dots underneath; pointer-events-auto below restores the real
          content's own clickability. */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end px-4 sm:px-6 pb-16 sm:pb-[4.5rem] pointer-events-none">
        <div className="flex flex-col items-start gap-5 pointer-events-auto motion-safe:animate-[fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_100ms_both]">
          <HeroBrandLockup />

          <div className="min-h-[1.75rem] flex items-center">
            <div
              key={phraseIndex}
              className={
                "hero-tagline-contrast heading-metallic-gold gold-shine-text gpu-accelerate text-xs sm:text-sm font-semibold font-mono uppercase tracking-wide leading-snug antialiased subpixel-antialiased " +
                (reducePhraseMotion
                  ? ""
                  : "motion-safe:animate-[fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_both]")
              }
            >
              {HERO_PHRASES[phraseIndex]}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex max-w-full min-w-0 transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98]">
              <Link
                href={CONTACT_PAGE_PATH}
                data-lupfr-track="Book an Event"
                className="group flex items-center gap-3 px-6 py-3 btn-metallic-gold font-semibold tracking-normal rounded-full overflow-hidden relative max-w-full min-w-0 justify-center"
              >
                <span className="relative z-10">Book an Event</span>
              </Link>
            </div>

            <a
              href="#events"
              className="hero-outline-cta group flex items-center gap-2 px-6 py-3 border font-semibold tracking-normal rounded-full hover:border-accent hover:text-accent transition-[color,border-color,transform] duration-150 ease-out max-w-full min-w-0 justify-center whitespace-nowrap [font-size:var(--lupfr-pill-cta-fs)] leading-snug hover:scale-[1.03] active:scale-[0.98]"
            >
              Upcoming Events
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
