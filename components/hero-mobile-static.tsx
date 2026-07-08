"use client"

import Link from "next/link"
import { ArrowDown, Play } from "lucide-react"

import { ScheduleCallCta } from "@/components/schedule-call-cta"
import { LINKS } from "@/lib/links"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import {
  HeroFallbackPoster,
  HeroTitleContentMobile,
  HERO_PHRASES,
  HERO_POSTER_DARK_MOBILE,
  HERO_POSTER_LIGHT_MOBILE,
  useHeroTheme,
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
  const heroTheme = useHeroTheme()
  const activePosterSrc =
    heroTheme === "light" ? HERO_POSTER_LIGHT_MOBILE : HERO_POSTER_DARK_MOBILE

  return (
    <>
      <div className="absolute inset-0 bg-black">
        <HeroFallbackPoster posterSrc={activePosterSrc} />
        <div className="absolute inset-0 bg-black/25 z-[5]" aria-hidden />
        <div className="absolute inset-0 lupfr-hero-media-wash z-10" aria-hidden />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 md:pt-40 pb-24 sm:pb-28 md:pb-32">
        <div className="text-center motion-safe:animate-[fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_100ms_both]">
          <HeroTitleContentMobile prefersReducedMotion={prefersReducedMotion} />

          <div
            className="mt-6 sm:mt-8 min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center justify-center w-full max-w-4xl mx-auto px-8 sm:px-12 md:px-20 lg:px-24"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              key={phraseIndex}
              className={
                "heading-metallic-gold gold-shine-text gpu-accelerate max-w-2xl mx-auto w-full text-center text-sm sm:text-base md:text-lg font-medium font-sans tracking-tight leading-snug antialiased subpixel-antialiased " +
                (reducePhraseMotion
                  ? ""
                  : "motion-safe:animate-[fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_both]")
              }
            >
              {HERO_PHRASES[phraseIndex]}
            </div>
          </div>

          <div
            className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <div className="inline-flex max-w-full min-w-0 transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98]">
              <Link
                href={CONTACT_PAGE_PATH}
                className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 btn-metallic-gold font-semibold tracking-normal rounded-full overflow-hidden relative max-w-full min-w-0 justify-center"
              >
                <span className="relative z-10">Book an Event</span>
              </Link>
            </div>

            <ScheduleCallCta
              tone="on-dark"
              size="md"
              className="transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98]"
            />

            <a
              href={LINKS.watchReel}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 border border-foreground/30 dark:border-border text-foreground font-semibold tracking-normal rounded-full hover:border-accent hover:text-accent transition-[color,border-color,transform] duration-150 ease-out max-w-full min-w-0 justify-center whitespace-nowrap [font-size:var(--lupfr-pill-cta-fs)] leading-snug hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="transition-transform duration-150 group-hover:rotate-90">
                <Play size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </span>
              Watch Reel
            </a>
          </div>
        </div>

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
