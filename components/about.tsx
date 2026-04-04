"use client"

import Image from "next/image"
import { motion, useInView, useScroll, useTransform, animate, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Sparkles, Users, Zap } from "lucide-react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"

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
    description: "Every artist, every venue, every detail is intentionally selected to create cohesive experiences.",
    detail: "From lineup selection to venue fit and vibe alignment, we treat each event as a single narrative. No filler sets, no random bookings—every slot earns its place.",
    strength: 100,
  },
  {
    number: 2,
    title: "Community",
    description: "We build connections that last beyond the dancefloor. Our events are where friendships form.",
    detail: "Regulars become friends; newcomers feel welcome. We foster a respectful, inclusive crowd so the energy stays high and the room stays safe. That’s the LUPFR standard.",
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
              <span className="uppercase tracking-widest">
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
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section id="about" ref={ref} className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      <ScrollReveal variant="up" amountIn={0.2} className="relative">
        <div ref={containerRef} className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4">The Story</p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6">
              <GoldShineText scrollTargetRef={ref}>Culture Meets</GoldShineText>
              <br />
              <span className="text-muted-foreground">Production</span>
            </h2>
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-px bg-accent" />
                <p className="text-foreground font-medium">Will Lupfer, Founder &amp; CEO of LUPFR Entertainment</p>
              </div>
            </div>
            {/* Portrait: dark = vignette fade into section; light = minimal overlay so the photo stays clear */}
            <div className="relative w-full max-w-sm mb-8 rounded-2xl overflow-hidden ring-1 ring-black/[0.06] dark:ring-0">
              <div className="absolute inset-0 bg-gradient-to-t from-background/25 via-transparent to-transparent dark:from-background dark:via-background/20 z-10 pointer-events-none" />
              <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-background/80 via-transparent to-background/80 z-10 pointer-events-none" />
              <Image
                src="/images/will_lupfer.jpg"
                alt="Will Lupfer, Founder & CEO of LUPFR Entertainment"
                width={400}
                height={500}
                sizes="(max-width: 768px) 100vw, 400px"
                className="w-full h-auto object-cover object-top"
              />
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                <GoldShineText scrollTargetRef={ref}>LUPFR Entertainment</GoldShineText> was born from a simple idea: San Francisco deserves music experiences that match its energy and creativity. We saw a gap between the underground scene and accessible, high-quality events.
              </p>
              <p>
                Today, we produce boat parties on the Bay, rooftop sessions with skyline views, warehouse events, and anything in between that bring back the raw energy of the city—all while maintaining the polish that attracts SF&apos;s young professional crowd.
              </p>
              <p>
                Whether you&apos;re a venue looking to elevate your programming, a brand seeking authentic nightlife partnerships, or simply someone who wants to dance to great music with a great crowd—we&apos;re here to make it happen.
              </p>
            </div>

          </motion.div>

          {/* Right - Values */}
          <motion.div
            style={{ y }}
            className="relative"
          >
            <div className="space-y-8">
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
