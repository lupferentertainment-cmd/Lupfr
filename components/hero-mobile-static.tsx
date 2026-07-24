"use client"

import Link from "next/link"
import { ArrowDown, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { ScheduleCallCta } from "@/components/schedule-call-cta"
import { LINKS } from "@/lib/links"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import {
  HeroFallbackPoster,
  HeroTitleContentMobile,
  HERO_PHRASES,
  HERO_POSTER_DARK_MOBILE,
  HERO_POSTER_LIGHT_MOBILE,
  HERO_VIDEO_DARK,
  HERO_VIDEO_LIGHT,
  useHeroTheme,
} from "@/components/hero-shared"

type HeroMobileStaticSectionProps = {
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/**
 * Mobile (& SSR pre-breakpoint): HD poster for LCP, then the same yacht MP4
 * fades in after `window` load + idle (skipped for prefers-reduced-motion so
 * the mobile perf gate stays poster-only). No Framer / parallax on this path.
 */
export function HeroMobileStaticSection({
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroMobileStaticSectionProps) {
  const heroTheme = useHeroTheme()
  const activePosterSrc =
    heroTheme === "light" ? HERO_POSTER_LIGHT_MOBILE : HERO_POSTER_DARK_MOBILE
  const activeVideoSrc = heroTheme === "light" ? HERO_VIDEO_LIGHT : HERO_VIDEO_DARK
  const allowDeferredVideo = prefersReducedMotion === false

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [mountVideo, setMountVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    if (!allowDeferredVideo) return

    let cancelled = false
    let idleId: number | undefined
    let timeoutId: number | undefined

    const armVideo = () => {
      if (cancelled) return
      const start = () => {
        if (!cancelled) setMountVideo(true)
      }
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(start, { timeout: 1800 })
      } else {
        timeoutId = window.setTimeout(start, 400)
      }
    }

    if (document.readyState === "complete") {
      armVideo()
    } else {
      window.addEventListener("load", armVideo, { once: true })
    }

    return () => {
      cancelled = true
      window.removeEventListener("load", armVideo)
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [allowDeferredVideo])

  useEffect(() => {
    if (!mountVideo) return
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.loop = true
    video.setAttribute("muted", "")
    video.setAttribute("playsinline", "")

    const markReady = () => setVideoReady(true)
    const ensurePlaying = () => {
      if (!video.paused && !video.ended) {
        markReady()
        return
      }
      if (video.ended) video.currentTime = 0
      void video.play().then(markReady).catch(() => {
        /* Autoplay blocked — keep HD poster. */
      })
    }

    const onReady = () => {
      markReady()
      ensurePlaying()
    }

    video.addEventListener("loadeddata", onReady)
    video.addEventListener("canplay", onReady)
    video.addEventListener("playing", markReady)

    if (video.readyState >= 2) onReady()
    else {
      video.load()
      ensurePlaying()
    }

    return () => {
      video.removeEventListener("loadeddata", onReady)
      video.removeEventListener("canplay", onReady)
      video.removeEventListener("playing", markReady)
    }
  }, [mountVideo, activeVideoSrc])

  return (
    <>
      <div className="absolute inset-0 bg-black">
        <HeroFallbackPoster posterSrc={activePosterSrc} />
        {mountVideo && (
          <video
            key={activeVideoSrc}
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            poster={activePosterSrc}
            className={
              "absolute inset-0 z-[2] h-full w-full object-cover object-center [image-rendering:auto] " +
              "motion-safe:transition-opacity motion-safe:duration-700 motion-reduce:transition-none " +
              (videoReady ? "opacity-100" : "opacity-0")
            }
            aria-hidden
          >
            <source src={activeVideoSrc} type="video/mp4" />
          </video>
        )}
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
                "hero-tagline-contrast heading-metallic-gold gold-shine-text gpu-accelerate max-w-2xl mx-auto w-full text-center text-xs sm:text-sm md:text-base font-semibold font-mono uppercase tracking-wide leading-snug antialiased subpixel-antialiased " +
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
                data-lupfr-track="Book an Event"
                className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 btn-metallic-gold font-semibold tracking-normal rounded-full overflow-hidden relative max-w-full min-w-0 justify-center"
              >
                <span className="relative z-10">Book an Event</span>
              </Link>
            </div>

            <ScheduleCallCta
              tone="on-dark"
              size="md"
              className="hero-outline-cta transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98]"
            />

            <a
              href={LINKS.watchReel}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-outline-cta group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 border font-semibold tracking-normal rounded-full hover:border-accent hover:text-accent transition-[color,border-color,transform] duration-150 ease-out max-w-full min-w-0 justify-center whitespace-nowrap [font-size:var(--lupfr-pill-cta-fs)] leading-snug hover:scale-[1.03] active:scale-[0.98]"
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
            className="hero-scroll-cue flex flex-col items-center gap-2 transition-colors"
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
