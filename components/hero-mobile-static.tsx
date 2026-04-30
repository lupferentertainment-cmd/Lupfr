"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown, Play } from "lucide-react"

import { GoldShineText } from "@/components/gold-shine-text"
import { MotionScheduleCallCta } from "@/components/schedule-call-cta"
import { LINKS } from "@/lib/links"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import {
  FADE_DURATION_S,
  HeroFallbackPoster,
  HeroTitleContentMobile,
  HERO_PHRASES,
} from "@/components/hero-shared"

type HeroMobileStaticSectionProps = {
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/** Mobile (& SSR pre-breakpoint): poster image only, no hero videos, no `useScroll` / parallax. */
export function HeroMobileStaticSection({
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroMobileStaticSectionProps) {
  return (
    <>
      <div className="absolute inset-0 bg-black">
        <HeroFallbackPoster />
        <div className="absolute inset-0 bg-black/35 z-[5]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background z-10" />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 md:pt-40 pb-24 sm:pb-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <HeroTitleContentMobile prefersReducedMotion={prefersReducedMotion} />

          <div
            className="mt-6 sm:mt-8 min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center justify-center w-full max-w-4xl mx-auto px-8 sm:px-12 md:px-20 lg:px-24"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={phraseIndex}
                className="max-w-2xl mx-auto w-full text-center"
                initial={
                  reducePhraseMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reducePhraseMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(3px)" }}
                transition={{ duration: FADE_DURATION_S, ease: [0.22, 1, 0.36, 1] }}
              >
                <GoldShineText
                  variant="static"
                  as="div"
                  className="text-sm sm:text-base md:text-lg font-medium font-sans tracking-tight leading-snug antialiased subpixel-antialiased"
                >
                  {HERO_PHRASES[phraseIndex]}
                </GoldShineText>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex max-w-full min-w-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <Link
                href={CONTACT_PAGE_PATH}
                className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 btn-metallic-gold font-semibold tracking-normal rounded-full overflow-hidden relative max-w-full min-w-0 justify-center"
              >
                <span className="relative z-10">Book an Event</span>
              </Link>
            </motion.div>

            <MotionScheduleCallCta
              tone="on-dark"
              size="md"
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(115, 98, 72, 0.2)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            />

            <motion.a
              href={LINKS.watchReel}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 border border-foreground/30 dark:border-border text-foreground font-semibold tracking-normal rounded-full hover:border-accent hover:text-accent transition-colors max-w-full min-w-0 justify-center whitespace-nowrap [font-size:var(--lupfr-pill-cta-fs)] leading-snug"
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(115, 98, 72, 0.25)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <motion.span whileHover={{ rotate: 90 }}>
                <Play size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </motion.span>
              Watch Reel
            </motion.a>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 sm:bottom-6 md:bottom-12 left-1/2 -translate-x-1/2">
          <a
            href="#events"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll to events"
          >
            <span className="text-xs tracking-normal">Scroll</span>
            <ArrowDown size={20} />
          </a>
        </div>
      </div>
    </>
  )
}
