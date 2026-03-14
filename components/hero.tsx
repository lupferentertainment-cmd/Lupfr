"use client"

import { preload } from "react-dom"
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion, type MotionValue } from "framer-motion"
import { useRef, useState, useEffect, memo } from "react"

import { ArrowDown, Play } from "lucide-react"
import { LINKS } from "@/lib/links"
import { useIsMobile } from "@/hooks/use-mobile"

const HERO_PHRASES = [
  "Curating unforgettable music experiences. Boat parties, rooftop events, and warehouse sessions that move the city.",
  "Where the Bay dances. Premier music events that define San Francisco nightlife.",
  "From boat parties to warehouses—we turn every night into an experience.",
  "Sound that moves you. Events that move the city.",
  "San Francisco's pulse. Music, elevated.",
  "Rooftops, boats, warehouses. One vibe. One city.",
  "We don't just throw parties. We create moments that last.",
  "The city's most iconic music experiences—curated, produced, unforgettable.",
  "Where beats meet the Bay. Where crowds become communities.",
  "Ten years of moving dance floors. One mission: make every night matter.",
]

const PHRASE_DURATION_MS = 4500
const FADE_DURATION_S = 0.6

const HERO_VIDEO_SLOW_MS = 30000
const HERO_VIDEO_DARK = "/hero_dark.mp4"
const HERO_VIDEO_LIGHT = "/hero_light_opt.mp4"
const HERO_POSTER = "/hero-poster.jpg"
const HERO_FALLBACK_IMAGE = HERO_POSTER

const staticShinePositionCss = "50% 50%"

/** LUPFR: plain span + CSS-only gradient oscillation so it never re-renders; no Framer, no inline style. */
const HeroLupfrText = memo(function HeroLupfrText({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <span
      className={`inline-flex items-baseline justify-center gap-0 overflow-visible hero-gold-shine-scroll gpu-accelerate ${prefersReducedMotion ? "hero-gold-shine-static" : "hero-gold-shine-periodic"}`}
    >
      <span className="inline-block text-[1.2em] leading-[1]">L</span>
      <span className="inline-block text-[1em] leading-[1]">U</span>
      <span className="inline-block text-[0.85em] leading-[1]">P</span>
      <span className="inline-block text-[1em] leading-[1]">F</span>
      <span className="inline-block text-[1.2em] leading-[1]">R</span>
    </span>
  )
})

/** Memoized so title block does not re-render when phraseIndex changes. */
const HeroTitleContent = memo(function HeroTitleContent({
  prefersReducedMotion,
  shinePositionDelayed,
}: {
  prefersReducedMotion: boolean | null
  shinePositionDelayed: MotionValue<string>
}) {
  return (
    <h1
      className="font-serif hero-title-lupfr font-bold tracking-tighter leading-none text-center flex flex-col items-center uppercase gap-1.5 sm:gap-2 md:gap-3"
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

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const videoDarkRef = useRef<HTMLVideoElement>(null)
  const videoLightRef = useRef<HTMLVideoElement>(null)

  const setVideoDarkRef = (el: HTMLVideoElement | null) => {
    videoDarkRef.current = el
    if (el) el.loop = true
  }
  const setVideoLightRef = (el: HTMLVideoElement | null) => {
    videoLightRef.current = el
    if (el) el.loop = true
  }
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [fallbackToImage, setFallbackToImage] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  // Preload video only on desktop to keep mobile fast (no video load)
  useEffect(() => {
    if (isMobile !== false) return
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    preload(prefersDark ? HERO_VIDEO_DARK : HERO_VIDEO_LIGHT, { as: "video", fetchPriority: "high" })
  }, [isMobile])

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length)
    }, PHRASE_DURATION_MS)
    return () => clearInterval(id)
  }, [])

  // Mobile: skip video and use poster to avoid autoplay issues and improve load
  useEffect(() => {
    if (isMobile === true) setFallbackToImage(true)
  }, [isMobile])

  useEffect(() => {
    if (fallbackToImage) return
    const darkEl = videoDarkRef.current
    const lightEl = videoLightRef.current
    if (!darkEl || !lightEl) return

    const videos = [darkEl, lightEl]
    videos.forEach((v) => { v.loop = true })

    const useFallback = () => setFallbackToImage(true)
    const timeoutId = setTimeout(useFallback, HERO_VIDEO_SLOW_MS)

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
      useFallback()
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
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", isMobile === false ? "50%" : "0%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, isMobile === false ? 1.2 : 1])
  /* Shine sweeps left→right in first 20% of scroll */
  const shinePositionDelayed = useTransform(scrollYProgress, [0, 0.04, 0.24, 1], ["100% 50%", "100% 50%", "0% 50%", "0% 50%"])

  return (
    <section ref={containerRef} className="relative min-h-[100vh] min-h-[100dvh] overflow-hidden">
      {/* Animated Background Grid - opacity only (compositor-friendly) */}
      <motion.div
        className="absolute inset-0 gpu-accelerate bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Gradient Orbs - transform + opacity only (no filter animation) */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 gpu-accelerate bg-accent/20 rounded-full blur-[128px]"
        animate={
          prefersReducedMotion
            ? { scale: 1, opacity: 0.45, x: 0, y: 0 }
            : { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], x: [0, 30, 0], y: [0, -20, 0] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 gpu-accelerate bg-accent/10 rounded-full blur-[128px]"
        animate={
          prefersReducedMotion
            ? { scale: 1.1, opacity: 0.35, x: 0, y: 0 }
            : { scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2], x: [0, -20, 0], y: [0, 15, 0] }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gpu-accelerate bg-accent/5 rounded-full blur-[180px]"
        animate={
          prefersReducedMotion
            ? { scale: 1.1, opacity: 0.22, rotate: 0 }
            : { scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15], rotate: [0, 180, 360] }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div style={{ y, scale }} className="absolute inset-0 bg-black">
        {fallbackToImage || isMobile !== false ? (
          <img
            src={HERO_POSTER}
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-center [image-rendering:auto]"
            sizes="100vw"
            fetchPriority="high"
            aria-hidden
          />
        ) : (
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
        {/* Seamless fade into next section: softer gradient for smooth handoff to stats */}
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
          <HeroTitleContent
            prefersReducedMotion={prefersReducedMotion}
            shinePositionDelayed={shinePositionDelayed}
          />

          <div
            className="mt-6 sm:mt-8 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center w-full max-w-4xl mx-auto px-8 sm:px-12 md:px-20 lg:px-24"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={phraseIndex}
                className="text-sm sm:text-base md:text-lg font-medium tracking-tight leading-snug text-center max-w-2xl mx-auto text-gold-accent antialiased gpu-accelerate subpixel-antialiased"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: FADE_DURATION_S, ease: [0.22, 1, 0.36, 1] }}
              >
                {HERO_PHRASES[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div 
            className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.a
              href="#contact"
              className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 btn-metallic-gold font-semibold uppercase tracking-wider rounded-full overflow-hidden relative text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <span className="relative z-10">Book an Event</span>
            </motion.a>

            <motion.a
              href={LINKS.watchReel}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 border border-white/80 dark:border-border text-white dark:text-foreground font-semibold uppercase tracking-wider rounded-full hover:border-accent hover:text-accent dark:hover:text-accent transition-colors text-sm sm:text-base"
              whileHover={{ scale: 1.05, boxShadow: "0 0 24px oklch(0.48 0.06 74 / 0.25)" }}
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

        <motion.div
          className="absolute bottom-8 sm:bottom-6 md:bottom-12 left-1/2 -translate-x-1/2"
          animate={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: [0, 14, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.a
            href="#events"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll to events"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.span
              animate={prefersReducedMotion ? { y: 0 } : { y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={20} />
            </motion.span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Corner Decorations - sleek animated reveal */}
      <motion.div
        className="absolute top-4 left-4 sm:top-8 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 border-l border-t border-accent/50 rounded-tl-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 border-r border-t border-accent/50 rounded-tr-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-12 h-12 sm:w-16 sm:h-16 border-l border-b border-accent/50 rounded-bl-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 border-r border-b border-accent/50 rounded-br-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  )
}
