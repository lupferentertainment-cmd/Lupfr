"use client"

import { motion, useInView, useScroll, useTransform, animate, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { MapPin, Sparkles, Users, Zap } from "lucide-react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { TextReveal } from "@/components/text-reveal"

function CountUpOrdinal({ end, isInView }: { end: number; isInView: boolean }) {
  const [display, setDisplay] = useState(0)
  const hasStarted = useRef(false)
  useEffect(() => {
    if (!isInView) return
    if (hasStarted.current) return
    hasStarted.current = true
    const controls = animate(0, end, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, end])
  return <span className="tabular-nums">{String(display).padStart(2, "0")}</span>
}

const values = [
  {
    number: 1,
    title: "Curation",
    description: "Every artist, venue, and detail is intentionally selected to create a unique music experience.",
    detail: "From lineup selection to venue fit and vibe alignment, we treat each event as a single narrative. No filler sets, no random bookings—every slot earns its place.",
    strength: 100,
  },
  {
    number: 2,
    title: "Expertise",
    description: "Our experience and connections in the industry allow us to build exactly what you envision.",
    detail: "We pair venue relationships, artist curation, and production know-how so every event feels intentional from first brief to final track.",
    strength: 100,
  },
  {
    number: 3,
    title: "Quality",
    description: "Premium sound, immersive lighting, stylish venues. We don't compromise on production value.",
    detail: "We partner with top-tier vendors and venues. Crystal-clear sound, thoughtful lighting design, and spaces that match the caliber of the music and the crowd.",
    strength: 100,
  },
]

const valueIcons = [Sparkles, Users, Zap] as const

// Same tilt range as events/artists/services: ±6deg, snappy spring
const TILT_SPRING = { stiffness: 420, damping: 32 }

function AboutValueCard({
  value,
  index,
  isInView,
  isExpanded,
  onToggle,
}: {
  value: (typeof values)[number]
  index: number
  isInView: boolean
  isExpanded: boolean
  onToggle: () => void
}) {
  const cardRef = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), TILT_SPRING)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), TILT_SPRING)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, x: 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ease-snap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={!isExpanded ? { scale: 1.01 } : undefined}
    >
      <motion.div
        animate={{
          borderColor: isExpanded ? "rgba(168, 130, 52, 0.45)" : "var(--border)",
          boxShadow: isExpanded
            ? "0 0 0 1px rgba(168, 130, 52, 0.2), 0 0 20px rgba(95, 78, 48, 0.06)"
            : "0 0 0 1px transparent",
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-transparent"
      >
        <motion.button
          type="button"
          onClick={onToggle}
          className="group w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
          aria-expanded={isExpanded}
          aria-controls={`value-detail-${value.number}`}
          id={`value-trigger-${value.number}`}
        >
        <div className="flex items-start gap-6 p-8">
          <div className="flex flex-col items-center gap-2">
            <span
              className={`text-5xl font-bold tabular-nums transition-colors duration-200 ease-snap ${
                isExpanded ? "text-accent/70" : "text-accent/20 group-hover:text-accent/40"
              }`}
            >
              <CountUpOrdinal end={value.number} isInView={isInView} />
            </span>
            {(() => {
              const Icon = valueIcons[index]
              return (
                <Icon
                  className={`h-6 w-6 transition-colors duration-200 ease-snap ${
                    isExpanded ? "text-accent" : "text-accent/30 group-hover:text-accent/50"
                  }`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              )
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-xl font-bold mb-3 transition-colors duration-200 ease-snap ${
                isExpanded ? "text-accent" : "group-hover:text-accent/90"
              }`}
            >
              {value.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {value.description}
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/50">
              <motion.div
                className="h-full rounded-full bg-accent/40"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${value.strength}%` } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <motion.span
              className="mt-3 inline-flex items-center gap-2 text-sm text-accent/80"
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <span className="tracking-normal">
                {isExpanded ? "Less" : "More"}
              </span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                ▼
              </motion.span>
            </motion.span>
          </div>
        </div>
        </motion.button>

        <AnimatePresence initial={false}>
          {isExpanded && value.detail && (
            <motion.div
              id={`value-detail-${value.number}`}
              role="region"
              aria-labelledby={`value-trigger-${value.number}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.18 } }}
              className="overflow-hidden border-t border-border/80"
            >
              <div className="px-8 py-6 bg-muted/30">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {value.detail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  )
}

export function About() {
  const ref = useRef(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (!isInView) return
    setHasRevealed(true)
  }, [isInView])
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section id="about" ref={ref} className="pt-8 sm:pt-9 md:pt-11 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 relative overflow-hidden">
      <ScrollReveal variant="up" amountIn={0.2} className="relative">
        <div ref={containerRef} className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8 xl:gap-10 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-gold-accent tracking-tight text-sm mb-4">The story</p>
            <h2 className="lupfr-heading--compact lupfr-heading-stack--tight">
              <GoldShineText scrollTargetRef={ref}>Redefining the Music</GoldShineText>
              <br />
              <span className="lupfr-heading-subline">Experience</span>
            </h2>
            {/* Condensed: no founder portrait here — his face lives in the Team section below (owner request, 2026-07-02). */}
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                <GoldShineText scrollTargetRef={ref}>LUPFR</GoldShineText> redefines the music experience. We blend non-traditional venues with specially curated artists to create a one of a kind music experience. LUPFR was founded in 2025 with a simple idea: California deserves music experiences that match its energy and creativity. We saw a gap between the underground scene and accessible, high-quality events.
              </p>
              <TextReveal
                text="Today, we produce unique events in both San Francisco and Los Angeles; ranging from yacht parties, boiler room style nights, corporate events, warehouse events, and anything in between that creates a one of a kind music experience."
                stagger={0.012}
              />
              <TextReveal
                text="Whether you're a venue looking to elevate your programming, a brand seeking a high caliber artist for a launch party, or simply someone who wants to dance to great music with a great crowd - we're here to make it happen."
                stagger={0.012}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-6">
                <div className="w-16 h-px bg-accent" />
                <p className="text-foreground font-medium">Will Lupfer — CEO &amp; Founder of LUPFR Entertainment</p>
              </div>
              <p className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin size={14} className="shrink-0" aria-hidden />
                87 N Raymond, Pasadena, CA
              </p>
            </div>

          </motion.div>

          {/* Right - Values */}
          <motion.div
            style={{ y }}
            className="relative"
          >
            <div className="space-y-6">
              {values.map((value, i) => (
                <AboutValueCard
                  key={value.number}
                  value={value}
                  index={i}
                  isInView={isInView}
                  isExpanded={expandedIndex === i}
                  onToggle={() => setExpandedIndex((prev) => (prev === i ? null : i))}
                />
              ))}
            </div>

            {/* Decorative Element - subtle motion */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 border border-accent/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-24 h-24 border border-accent/10 rounded-full"
              animate={{ rotate: -360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
            />
          </motion.div>
        </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
