"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ArrowDown, Play } from "lucide-react"
import { LINKS } from "@/lib/links"

const HERO_PHRASES = [
  "Curating unforgettable house music experiences. Boat parties, rooftop events, and warehouse sessions that move the city.",
  "Where the Bay dances. Premier house music events that define San Francisco nightlife.",
  "From boat parties to warehouses—we turn every night into an experience.",
  "Sound that moves you. Events that move the city.",
  "San Francisco's pulse. House music, elevated.",
  "Rooftops, boats, warehouses. One vibe. One city.",
  "We don't just throw parties. We create moments that last.",
  "The city's most iconic house music experiences—curated, produced, unforgettable.",
  "Where beats meet the Bay. Where crowds become communities.",
  "Ten years of moving dance floors. One mission: make every night matter.",
]

const PHRASE_DURATION_MS = 4500
const FADE_DURATION_S = 0.6

const HERO_VIDEO_SLOW_MS = 4000
const HERO_VIDEO_SRC = "/vecteezy_people-dancing-with-mixed-music-suitable-for-all-speeds-in_26462763.mp4"
const HERO_FALLBACK_IMAGE = "/hero.jpg"

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [fallbackToImage, setFallbackToImage] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length)
    }, PHRASE_DURATION_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (fallbackToImage) return
    const video = videoRef.current
    if (!video) return

    const useFallback = () => setFallbackToImage(true)
    const timeoutId = setTimeout(useFallback, HERO_VIDEO_SLOW_MS)

    const onCanPlay = () => clearTimeout(timeoutId)
    const onError = () => {
      clearTimeout(timeoutId)
      useFallback()
    }

    video.addEventListener("canplay", onCanPlay, { once: true })
    video.addEventListener("error", onError, { once: true })
    return () => {
      clearTimeout(timeoutId)
      video.removeEventListener("canplay", onCanPlay)
      video.removeEventListener("error", onError)
    }
  }, [fallbackToImage])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2])

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Animated Background Grid - subtle drift */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Gradient Orbs - stronger pulse */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[180px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div style={{ y, scale }} className="absolute inset-0">
        {fallbackToImage ? (
          <img
            src={HERO_FALLBACK_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover [image-rendering:auto]"
            sizes="100vw"
            fetchPriority="high"
            aria-hidden
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover [image-rendering:auto]"
            poster={HERO_FALLBACK_IMAGE}
            aria-hidden
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/35 z-[5]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-10" />
      </motion.div>

      <motion.div 
        style={{ opacity }}
        className="relative z-20 h-full flex flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
        >
          <motion.p
            className="text-gold-accent font-light uppercase tracking-[0.3em] text-sm mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            San Francisco House Music
          </motion.p>

          <motion.h1
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[9rem] 2xl:text-[11rem] font-bold tracking-tighter leading-none text-center flex flex-col items-center uppercase gap-2 sm:gap-3"
          >
            <span className="block text-white">Lupfer</span>
            <span className="block hero-entertainment-gradient">Entertainment</span>
          </motion.h1>

          <div
            className="mt-8 min-h-[5rem] md:min-h-[6rem] lg:min-h-[7rem] relative w-full max-w-3xl mx-auto px-4"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={phraseIndex}
                className="text-lg md:text-xl lg:text-2xl font-medium tracking-tight leading-snug text-center absolute top-1/2 left-0 right-0 -translate-y-1/2 drop-shadow-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: FADE_DURATION_S, ease: [0.22, 1, 0.36, 1] }}
              >
                {HERO_PHRASES[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div 
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.a
              href="#events"
              className="group flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground font-semibold uppercase tracking-wider rounded-full overflow-hidden relative"
              whileHover={{ scale: 1.08, boxShadow: "0 0 40px oklch(0.72 0.14 88 / 0.4)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="relative z-10">Upcoming Events</span>
              <motion.span
                className="absolute inset-0 bg-foreground"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.a>

            <motion.a
              href={LINKS.watchReel}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 border border-border text-foreground font-semibold uppercase tracking-wider rounded-full hover:border-accent hover:text-accent transition-colors"
              whileHover={{ scale: 1.08, borderColor: "oklch(0.72 0.14 88 / 0.8)", boxShadow: "0 0 30px oklch(0.72 0.14 88 / 0.2)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.span whileHover={{ rotate: 90 }}>
                <Play size={18} className="group-hover:scale-110 transition-transform" />
              </motion.span>
              Watch Reel
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 14, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.a
            href="#events"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown size={20} />
            </motion.span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Corner Decorations - animated reveal */}
      <motion.div
        className="absolute top-8 left-8 w-24 h-24 border-l border-t border-accent/40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute top-8 right-8 w-24 h-24 border-r border-t border-accent/40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-8 left-8 w-24 h-24 border-l border-b border-accent/40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-8 right-8 w-24 h-24 border-r border-b border-accent/40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.65, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  )
}
