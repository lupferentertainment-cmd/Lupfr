"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion, type MotionValue } from "framer-motion"
import { useRef, useState, useEffect, memo } from "react"

import { ArrowDown, Play } from "lucide-react"
import { GoldShineText } from "@/components/gold-shine-text"
import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import { MotionScheduleCallCta } from "@/components/schedule-call-cta"
import { LINKS } from "@/lib/links"
import { cn } from "@/lib/utils"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import { useIsMobile } from "@/hooks/use-mobile"

const HERO_PHRASES = [
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

const PHRASE_DURATION_MS = 4500
const PHRASE_DURATION_MOBILE_MS = 9000
const FADE_DURATION_S = 0.6

const HERO_VIDEO_SLOW_MS = 30000
const HERO_VIDEO_DARK = "/hero/hero_dark.mp4"
const HERO_VIDEO_LIGHT = "/hero/hero_light_opt.mp4"
const HERO_POSTER = "/hero/hero-poster.webp"

const staticShinePositionCss = "50% 50%"

/** Remounts whenever `fallbackToImage` toggles on so poster decode state stays correct. */
function HeroFallbackPoster() {
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
        onLoadingComplete={() => setReady(true)}
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
const HeroLupfrText = memo(function HeroLupfrText({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <span
      className={`inline-block overflow-visible hero-gold-shine-scroll gpu-accelerate ${prefersReducedMotion ? "hero-gold-shine-static" : "hero-gold-shine-periodic"}`}
    >
      LUPFR
    </span>
  )
})

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

/** Mobile: no scroll-linked MotionValues — static Entertainment gradient. */
const HeroTitleContentMobile = memo(function HeroTitleContentMobile({
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
        style={{ backgroundPosition: staticShinePositionCss }}
      >
        Entertainment
      </span>
    </h1>
  )
})

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
  const videoDarkRef = useRef<HTMLVideoElement | null>(null)
  const videoLightRef = useRef<HTMLVideoElement | null>(null)

  const setVideoDarkRef = (el: HTMLVideoElement | null) => {
    videoDarkRef.current = el
    if (el) el.loop = true
  }
  const setVideoLightRef = (el: HTMLVideoElement | null) => {
    videoLightRef.current = el
    if (el) el.loop = true
  }
  const [fallbackToImage, setFallbackToImage] = useState(false)

  useEffect(() => {
    if (fallbackToImage) return
    const darkEl = videoDarkRef.current
    const lightEl = videoLightRef.current
    if (!darkEl || !lightEl) return

    const videos = [darkEl, lightEl]
    videos.forEach((v) => { v.loop = true })

    const triggerFallback = () => setFallbackToImage(true)
    const timeoutId = setTimeout(triggerFallback, HERO_VIDEO_SLOW_MS)

    const ensurePlaying = () => {
      videos.forEach((video) => {
        if (video.paused) {
          if (video.ended) video.currentTime = 0
          video.play().catch(() => {})
        }
      })
    }

    const onCanPlay = () => {
      clearTimeout(timeoutId)
      videos.forEach((v) => { v.loop = true })
      ensurePlaying()
    }
    const onError = () => {
      clearTimeout(timeoutId)
      triggerFallback()
    }
    const onPause = () => ensurePlaying()
    const restartVideo = (video: HTMLVideoElement) => {
      video.loop = true
      video.currentTime = 0
      video.play().catch(() => {})
    }
    const onEnded = (e: Event) => {
      const video = e.target as HTMLVideoElement
      if (video) restartVideo(video)
    }
    const onTimeUpdate = () => {
      videos.forEach((video) => {
        if (video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.25)) {
          restartVideo(video)
        }
      })
    }
    const onStalled = () => { videos.forEach((v) => v.play().catch(() => {})) }
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ensurePlaying()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) ensurePlaying()
      },
      { threshold: 0.1 }
    )
    videos.forEach((v) => observer.observe(v))

    videos.forEach((video) => {
      video.addEventListener("canplay", onCanPlay, { once: true })
      video.addEventListener("error", onError, { once: true })
      video.addEventListener("pause", onPause)
      video.addEventListener("ended", onEnded)
      video.addEventListener("timeupdate", onTimeUpdate)
      video.addEventListener("stalled", onStalled)
    })
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      videos.forEach((video) => {
        video.removeEventListener("canplay", onCanPlay)
        video.removeEventListener("error", onError)
        video.removeEventListener("pause", onPause)
        video.removeEventListener("ended", onEnded)
        video.removeEventListener("timeupdate", onTimeUpdate)
        video.removeEventListener("stalled", onStalled)
      })
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [fallbackToImage])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])
  const shinePositionDelayed = useTransform(scrollYProgress, [0, 0.04, 0.24, 1], ["100% 50%", "100% 50%", "0% 50%", "0% 50%"])

  return (
    <>
      <motion.div style={{ y, scale }} className="absolute inset-0 bg-black">
        {fallbackToImage ? <HeroFallbackPoster /> : (
          <>
            <video
              ref={setVideoDarkRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:auto] opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out"
              poster={HERO_POSTER}
              aria-hidden
            >
              <source src={HERO_VIDEO_DARK} type="video/mp4" />
            </video>
            <video
              ref={setVideoLightRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:auto] opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out"
              poster={HERO_POSTER}
              aria-hidden
            >
              <source src={HERO_VIDEO_LIGHT} type="video/mp4" />
            </video>
          </>
        )}
        <div className="absolute inset-0 bg-black/35 z-[5]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background z-10" />
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

type HeroMobileStaticSectionProps = {
  prefersReducedMotion: boolean | null
  phraseIndex: number
  reducePhraseMotion: boolean
}

/** Mobile (& SSR pre-breakpoint): poster image only, no hero videos, no `useScroll` / parallax. */
function HeroMobileStaticSection({
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

/**
 * Mobile/small-tablet (`useIsMobile() !== false`): poster hero, static gold taglines, lighter orbs.
 * Laptop/desktop (`useIsMobile() === false`): same full hero as before refactor — dual MP4s, `preload="auto"`,
 * scroll parallax (y/scale), content fade, scroll-driven title + `GoldShineText` on rotating lines.
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotionRaw = useReducedMotion()
  const prefersReducedMotion = mounted ? prefersReducedMotionRaw : null
  const isMobile = useIsMobile()
  /** Strict `false` only — laptop/desktop keeps the rich hero; do not use truthiness here. */
  const isDesktopViewport = isMobile === false
  const liteHero = prefersReducedMotion === true || !isDesktopViewport
  const phraseDurationMs = isDesktopViewport ? PHRASE_DURATION_MS : PHRASE_DURATION_MOBILE_MS
  const reducePhraseMotion = prefersReducedMotion === true

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length)
    }, phraseDurationMs)
    return () => clearInterval(id)
  }, [phraseDurationMs])

  const orbBlurSide = isDesktopViewport ? "blur-[100px] sm:blur-[128px]" : "blur-[56px] sm:blur-[72px]"
  const orbBlurCenter = isDesktopViewport
    ? "blur-[120px] sm:blur-[180px]"
    : "blur-[72px] sm:blur-[100px]"

  return (
    <section
      ref={containerRef}
      className="lupfr-hero relative min-h-[100vh] min-h-[100dvh] overflow-hidden"
    >
      {liteHero ? (
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
      ) : (
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
      )}

      {isDesktopViewport ? (
        <HeroDesktopParallaxSection
          containerRef={containerRef}
          liteHero={liteHero}
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
