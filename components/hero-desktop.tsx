"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { GoldShineText } from "@/components/gold-shine-text"
import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import {
  FADE_DURATION_S,
  HeroBrandLockup,
  HeroCornerReadout,
  HeroFilmstripArrows,
  HERO_FILMSTRIP_INTERVAL_MS,
  HERO_FILMSTRIP_PHOTOS,
  HERO_PHRASES,
  type HeroFilmstripPhoto,
} from "@/components/hero-shared"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import { cn } from "@/lib/utils"

type HeroFilmstripSlatProps = {
  photo: HeroFilmstripPhoto
  index: number
  isActive: boolean
  onSelect: (index: number) => void
  prioritize: boolean
}

/**
 * One vertical slat of the desktop filmstrip: the active slat widens (flex-grow
 * transition, plain CSS — no framer needed for a unitless CSS property) and its dim
 * overlay lifts; inactive slats stay narrow and dimmed. Hovering a slat (owner
 * request 2026-08-28, "make the tiles interactive") previews it immediately —
 * no click needed on desktop; clicking and keyboard focus still select it too, so
 * touch/keyboard users (no real `:hover`) aren't left without a way to pick one.
 */
function HeroFilmstripSlat({ photo, index, isActive, onSelect, prioritize }: HeroFilmstripSlatProps) {
  const [ready, setReady] = useState(false)
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      aria-label={`Show ${photo.alt}`}
      aria-current={isActive}
      className="hero-filmstrip-slat group relative h-full min-w-0 overflow-hidden transition-[flex-grow] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2"
      style={{ flexGrow: isActive ? 5 : 1, flexShrink: 1, flexBasis: 0 }}
    >
      <SkeletonShimmerLayer show={!ready} />
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(min-width: 1024px) 45vw, 100vw"
        priority={prioritize}
        fetchPriority={prioritize ? "high" : undefined}
        onLoad={() => setReady(true)}
        className={cn(
          "object-cover object-center motion-safe:transition-opacity motion-safe:duration-500 motion-reduce:transition-none",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-black motion-safe:transition-opacity motion-safe:duration-700 motion-reduce:transition-none",
          isActive ? "opacity-0" : "opacity-55 group-hover:opacity-35"
        )}
        aria-hidden
      />
    </button>
  )
}

type HeroDesktopParallaxSectionProps = {
  containerRef: React.RefObject<HTMLElement | null>
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/**
 * Desktop (≥768px): the six-photo filmstrip (owner restructure, 2026-08-28) —
 * auto-advances every ~5s, pauses under prefers-reduced-motion (still
 * hover/click/keyboard-selectable), and restarts its timer on any manual
 * selection so a deliberate hover/click sticks instead of jumping away mid-look.
 */
function HeroDesktopParallaxSection({
  containerRef,
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroDesktopParallaxSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const timeoutRef = useRef<number | undefined>(undefined)
  const autoAdvance = prefersReducedMotion !== true

  useEffect(() => {
    if (!autoAdvance) return
    timeoutRef.current = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_FILMSTRIP_PHOTOS.length)
    }, HERO_FILMSTRIP_INTERVAL_MS)
    return () => window.clearTimeout(timeoutRef.current)
  }, [activeIndex, autoAdvance])

  const selectSlat = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  return (
    <>
      <div className="absolute inset-0 flex bg-black" aria-hidden={false}>
        {HERO_FILMSTRIP_PHOTOS.map((photo, index) => (
          <HeroFilmstripSlat
            key={photo.id}
            photo={photo}
            index={index}
            isActive={index === activeIndex}
            onSelect={selectSlat}
            prioritize={index === 0}
          />
        ))}
        <div className="absolute inset-0 bg-black/20 z-[5] pointer-events-none" aria-hidden />
        <div className="absolute inset-0 lupfr-hero-media-wash z-10 pointer-events-none" aria-hidden />
      </div>

      <HeroFilmstripArrows activeIndex={activeIndex} onSelect={selectSlat} />
      <HeroCornerReadout />

      {/*
        absolute inset-0 (not h-full): the parent <section> in hero.tsx only sets
        min-h-[100vh]/min-h-[100dvh], not an explicit height, so a percentage
        height here doesn't reliably resolve against it in every browser and the
        copy block was collapsing to its own content height and rendering at the
        TOP of the hero instead of bottom-pinned (caught 2026-08-28 on the live
        preview deploy). Matches how the filmstrip layer and HeroCornerReadout
        above already position themselves against this same section.

        pointer-events-none (2026-08-29 owner report, "the arrows between
        slides on hero do not work"): this wrapper is `inset-0`, so its hit
        box covers the WHOLE hero even though `justify-end` only visually
        pins the real content to the bottom — with no pointer-events-none it
        sat on top of (same/higher z-index, later in DOM order than) the
        filmstrip slats and HeroFilmstripArrows above and silently ate every
        click meant for them. Same class of bug HeroCornerReadout's own
        pointer-events-none already guards against. pointer-events-auto is
        restored on the actual content wrapper below so its real
        buttons/links keep working.
      */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end px-4 sm:px-6 md:px-10 pb-8 sm:pb-10 md:pb-12 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-5 sm:gap-6 pointer-events-auto"
        >
          <HeroBrandLockup />

          <div
            className="min-h-[1.75rem] flex items-center"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={phraseIndex}
                initial={
                  reducePhraseMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reducePhraseMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8 }
                }
                transition={{ duration: FADE_DURATION_S, ease: [0.22, 1, 0.36, 1] }}
              >
                <GoldShineText
                  as="div"
                  scrollTargetRef={containerRef}
                  className="hero-tagline-contrast text-xs sm:text-sm font-semibold font-mono uppercase tracking-wide leading-snug antialiased subpixel-antialiased"
                >
                  {HERO_PHRASES[phraseIndex]}
                </GoldShineText>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="flex flex-wrap items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex max-w-full min-w-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <Link
                href={CONTACT_PAGE_PATH}
                data-lupfr-track="Book an Event"
                className="group flex items-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 btn-metallic-gold font-semibold tracking-normal rounded-full overflow-hidden relative max-w-full min-w-0 justify-center"
              >
                <span className="relative z-10">Book an Event</span>
              </Link>
            </motion.div>

            <motion.a
              href="#events"
              className="hero-outline-cta group flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 border font-semibold tracking-normal rounded-full hover:border-accent hover:text-accent transition-colors max-w-full min-w-0 justify-center whitespace-nowrap [font-size:var(--lupfr-pill-cta-fs)] leading-snug"
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(115, 98, 72, 0.25)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              Upcoming Events
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export type HeroDesktopViewportProps = {
  containerRef: React.RefObject<HTMLElement | null>
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/**
 * Desktop-only subtree: the six-photo filmstrip + scroll-linked copy.
 * Dynamically imported from `Hero` so phone viewports skip downloading this chunk.
 */
export default function HeroDesktopViewport({
  containerRef,
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroDesktopViewportProps) {
  return (
    <HeroDesktopParallaxSection
      containerRef={containerRef}
      prefersReducedMotion={prefersReducedMotion}
      phraseIndex={phraseIndex}
      reducePhraseMotion={reducePhraseMotion}
    />
  )
}
