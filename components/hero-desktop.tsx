"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { memo, useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence, type MotionValue } from "framer-motion"
import { ArrowDown, Play } from "lucide-react"

import { GoldShineText } from "@/components/gold-shine-text"
import { MotionScheduleCallCta } from "@/components/schedule-call-cta"
import {
  FADE_DURATION_S,
  HeroFallbackPoster,
  HeroLiteOrbs,
  HeroLupfrText,
  HERO_PHRASES,
  HERO_POSTER,
} from "@/components/hero-shared"
import { LINKS } from "@/lib/links"
import { CONTACT_PAGE_PATH } from "@/lib/site"

const HERO_VIDEO_SLOW_MS = 8000
const HERO_VIDEO_DARK = "/hero/hero_dark.mp4"
const HERO_VIDEO_LIGHT = "/hero/hero_light_opt.mp4"
const VIDEO_READY_STATE_HAS_CURRENT_DATA = 2

const staticShinePositionCss = "50% 50%"

/** Desktop: Entertainment line shine follows hero scroll. */
const HeroTitleContentDesktop = memo(function HeroTitleContentDesktop({
  prefersReducedMotion,
  shinePositionDelayed,
}: {
  prefersReducedMotion: boolean | null
  shinePositionDelayed: MotionValue<string>
}) {
  return (
    <h1
      className="font-serif hero-title-lupfr font-bold tracking-tighter leading-none text-center flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3"
    >
      <HeroLupfrText prefersReducedMotion={prefersReducedMotion} />
      <motion.span
        className="block hero-title-entertainment font-medium hero-entertainment-text normal-case tracking-normal"
        style={{ backgroundPosition: prefersReducedMotion ? staticShinePositionCss : shinePositionDelayed }}
      >
        Entertainment
      </motion.span>
    </h1>
  )
})

/** Animated blurred orbs — desktop full hero only (`liteHero === false`). */
function HeroDesktopMotionOnlyOrbs() {
  return (
    <>
      <motion.div
        className="absolute inset-0 gpu-accelerate bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 gpu-accelerate bg-accent/20 rounded-full blur-[128px]"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 gpu-accelerate bg-accent/10 rounded-full blur-[128px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2], x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gpu-accelerate bg-accent/5 rounded-full blur-[180px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </>
  )
}

type HeroDesktopParallaxSectionProps = {
  containerRef: React.RefObject<HTMLElement | null>
  liteHero: boolean
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/**
 * Desktop (≥768px): dual hero videos, scroll parallax on media + fade, scroll-driven title shine,
 * scroll-linked rotating tagline gold. Hooks stay in this subtree only — not on mobile.
 */
function HeroDesktopParallaxSection({
  containerRef,
  liteHero,
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroDesktopParallaxSectionProps) {
  const { resolvedTheme } = useTheme()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [fallbackToImage, setFallbackToImage] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const activeVideoSrc = resolvedTheme === "light" ? HERO_VIDEO_LIGHT : HERO_VIDEO_DARK

  useEffect(() => {
    setFallbackToImage(false)
    setVideoReady(false)
  }, [activeVideoSrc])

  useEffect(() => {
    if (fallbackToImage) return
    const video = videoRef.current
    if (!video) return

    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true

    const triggerFallback = () => setFallbackToImage(true)
    const timeoutId = setTimeout(triggerFallback, HERO_VIDEO_SLOW_MS)

    const markVideoReady = () => {
      clearTimeout(timeoutId)
      setVideoReady(true)
    }

    const handlePlaybackError = (error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return
      clearTimeout(timeoutId)
      triggerFallback()
    }

    const ensurePlaying = () => {
      if (!video.paused && !video.ended) return
      if (video.ended) video.currentTime = 0
      video.play().then(markVideoReady).catch(handlePlaybackError)
    }

    const onVideoReady = () => {
      markVideoReady()
      ensurePlaying()
    }
    const onError = () => {
      clearTimeout(timeoutId)
      triggerFallback()
    }
    const onPause = () => ensurePlaying()
    const restartVideo = () => {
      video.loop = true
      video.currentTime = 0
      video.play().then(markVideoReady).catch(handlePlaybackError)
    }
    const onEnded = () => restartVideo()
    const onTimeUpdate = () => {
      if (video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.25)) {
        restartVideo()
      }
    }
    const onStalled = () => ensurePlaying()
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePlaying()
    }

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) ensurePlaying()
        },
        { threshold: 0.1 }
      )
    observer?.observe(video)

    video.addEventListener("loadeddata", onVideoReady)
    video.addEventListener("canplay", onVideoReady)
    video.addEventListener("playing", onVideoReady)
    video.addEventListener("error", onError, { once: true })
    video.addEventListener("pause", onPause)
    video.addEventListener("ended", onEnded)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("stalled", onStalled)
    document.addEventListener("visibilitychange", onVisibilityChange)

    if (video.readyState >= VIDEO_READY_STATE_HAS_CURRENT_DATA) {
      onVideoReady()
    } else {
      ensurePlaying()
    }

    return () => {
      clearTimeout(timeoutId)
      observer?.disconnect()
      video.removeEventListener("loadeddata", onVideoReady)
      video.removeEventListener("canplay", onVideoReady)
      video.removeEventListener("playing", onVideoReady)
      video.removeEventListener("error", onError)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("stalled", onStalled)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [activeVideoSrc, fallbackToImage])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])
  const shinePositionDelayed = useTransform(
    scrollYProgress,
    [0, 0.04, 0.24, 1],
    ["100% 50%", "100% 50%", "0% 50%", "0% 50%"]
  )

  return (
    <>
      <motion.div style={{ y, scale }} className="absolute inset-0 bg-black">
        <HeroFallbackPoster />
        {!fallbackToImage && (
          <video
            key={activeVideoSrc}
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            className={`absolute inset-0 z-[2] w-full h-full object-cover object-center [image-rendering:auto] transition-opacity duration-500 ease-out ${videoReady ? "opacity-100" : "opacity-0"
              }`}
            poster={HERO_POSTER}
            aria-hidden
          >
            <source src={activeVideoSrc} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/25 z-[5]" aria-hidden />
        <div className="absolute inset-0 lupfr-hero-media-wash z-10" aria-hidden />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 pt-28 sm:pt-36 md:pt-40 pb-24 sm:pb-28 md:pb-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <HeroTitleContentDesktop
            prefersReducedMotion={prefersReducedMotion}
            shinePositionDelayed={shinePositionDelayed}
          />

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
                  reducePhraseMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 10, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  reducePhraseMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8, filter: "blur(3px)" }
                }
                transition={{ duration: FADE_DURATION_S, ease: [0.22, 1, 0.36, 1] }}
              >
                <GoldShineText
                  as="div"
                  scrollTargetRef={containerRef}
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

        {liteHero ? (
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
        ) : (
          <motion.div
            className="absolute bottom-8 sm:bottom-6 md:bottom-12 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 14, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.a
              href="#events"
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Scroll to events"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-xs tracking-normal">Scroll</span>
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown size={20} />
              </motion.span>
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

export type HeroDesktopViewportProps = {
  containerRef: React.RefObject<HTMLElement | null>
  liteHero: boolean
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/**
 * Desktop-only subtree: heavier Framer orb loops + hero videos + scroll-linked copy.
 * Dynamically imported from `Hero` so phone viewports skip downloading video / useScroll parity.
 */
export default function HeroDesktopViewport({
  containerRef,
  liteHero,
  prefersReducedMotion,
  phraseIndex,
  reducePhraseMotion,
}: HeroDesktopViewportProps) {
  return (
    <>
      {liteHero ? <HeroLiteOrbs variant="desktop" /> : <HeroDesktopMotionOnlyOrbs />}
      <HeroDesktopParallaxSection
        containerRef={containerRef}
        liteHero={liteHero}
        prefersReducedMotion={prefersReducedMotion}
        phraseIndex={phraseIndex}
        reducePhraseMotion={reducePhraseMotion}
      />
    </>
  )
}
