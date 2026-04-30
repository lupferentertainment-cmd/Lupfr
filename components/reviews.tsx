"use client"

import { useRef, useEffect, useState } from "react"
import {
  useInView,
  useReducedMotion,
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion"

import { useIsLowComputeDevice, useIsMobile } from "@/hooks/use-mobile"

const STAT_TILT_SPRING = { stiffness: 380, damping: 34 }
const STAT_PERSPECTIVE = 1100
const STAT_TILT_DEG = 5


const COUNT_UP_DURATION_MS = 1400
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function CountUpInt({
  end,
  suffix = "",
  isInView,
}: {
  end: number
  suffix?: string
  isInView: boolean
}) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)
  useEffect(() => {
    if (!nodeRef.current) return
    const node = nodeRef.current
    if (!isInView) {
      node.textContent = "0" + suffix
      hasStarted.current = false
      return
    }
    if (hasStarted.current) return
    hasStarted.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / COUNT_UP_DURATION_MS, 1)
      const eased = easeOutCubic(t)
      const value = Math.round(eased * end)
      node.textContent = String(value) + suffix
      if (t < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(id)
      hasStarted.current = false
    }
  }, [isInView, end, suffix])
  return <span ref={nodeRef} className="tabular-nums">0{suffix}</span>
}

function CountUpDecimal({
  end,
  decimals = 1,
  suffix = "",
  isInView,
}: {
  end: number
  decimals?: number
  suffix?: string
  isInView: boolean
}) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)
  useEffect(() => {
    if (!nodeRef.current) return
    const node = nodeRef.current
    if (!isInView) {
      node.textContent = "0" + suffix
      hasStarted.current = false
      return
    }
    if (hasStarted.current) return
    hasStarted.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / COUNT_UP_DURATION_MS, 1)
      const eased = easeOutCubic(t)
      const value = eased * end
      node.textContent = value.toFixed(decimals) + suffix
      if (t < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(id)
      hasStarted.current = false
    }
  }, [isInView, end, decimals, suffix])
  return <span ref={nodeRef} className="tabular-nums">0{suffix}</span>
}


type StatItem = {
  end: number
  suffix: string
  label: string
  type: "int" | "decimal"
  decimals?: number
}

/** Carousel slides: each slide is a set of 4 metrics. Count-up runs each time a slide is shown. */
const STATS_SLIDES: StatItem[][] = [
  [
    { end: 50, suffix: "+", label: "Events produced", type: "int" },
    { end: 4.9, suffix: "", label: "Star rating", type: "decimal", decimals: 1 },
    { end: 100, suffix: "+", label: "Reviews", type: "int" },
    { end: 10, suffix: "+", label: "Venue partners", type: "int" },
  ],
  [
    { end: 20, suffix: "+", label: "Events hosted", type: "int" },
    { end: 50, suffix: "+", label: "Artists booked", type: "int" },
    { end: 10, suffix: "k+", label: "Happy attendees", type: "int" },
    { end: 10, suffix: "+", label: "Venue partners", type: "int" },
  ],
  [
    { end: 5, suffix: "+", label: "Years experience", type: "int" },
    { end: 98, suffix: "%", label: "Client retention", type: "int" },
    { end: 200, suffix: "+", label: "Collaborations", type: "int" },
    { end: 12, suffix: "+", label: "Venue partners", type: "int" },
  ],
]

const STATS_CAROUSEL_INTERVAL_MS = 5000
const STATS_CAROUSEL_INTERVAL_MOBILE_MS = 9000

function useFinePointerHover(): boolean {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => setOk(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])
  return ok
}

function StatTile({
  stat,
  isActive,
  reducedMotion,
  canTilt,
}: {
  stat: StatItem
  isActive: boolean
  reducedMotion: boolean
  canTilt: boolean
}) {
  const tileRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [STAT_TILT_DEG, -STAT_TILT_DEG]),
    STAT_TILT_SPRING
  )
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [-STAT_TILT_DEG, STAT_TILT_DEG]),
    STAT_TILT_SPRING
  )

  const tiltOn = canTilt && !reducedMotion

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltOn || !tileRef.current) return
    const rect = tileRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) / rect.width)
    y.set((e.clientY - cy) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={tileRef}
      className="group relative min-h-[9.5rem] sm:min-h-[10.5rem] flex items-stretch [contain:layout]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        tiltOn
          ? {
              rotateX,
              rotateY,
              transformPerspective: STAT_PERSPECTIVE,
              transformStyle: "preserve-3d",
            }
          : { transformStyle: "preserve-3d" }
      }
    >
      <div
        className={[
          "relative w-full rounded-2xl border border-border/70 bg-card/50 dark:bg-card/40 px-4 py-5 sm:px-5 sm:py-6 text-center shadow-sm",
          "transition-[box-shadow,border-color,background-color] duration-200 ease-out",
          "group-hover:border-accent/25 group-hover:bg-card/80 dark:group-hover:bg-card/55",
          "group-hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.45)]",
          tiltOn ? "will-change-transform" : "",
        ].join(" ")}
        style={{ transform: "translateZ(0)" }}
      >
        <p className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight tabular-nums leading-none">
          {stat.type === "decimal" ? (
            <span className="heading-metallic-gold">
              <CountUpDecimal
                end={stat.end}
                decimals={stat.decimals ?? 1}
                suffix={stat.suffix}
                isInView={isActive}
              />
            </span>
          ) : (
            <span className="heading-metallic-gold">
              <CountUpInt end={stat.end} suffix={stat.suffix} isInView={isActive} />
            </span>
          )}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground tracking-tight mt-3 sm:mt-3.5 font-medium leading-snug max-w-[12rem] mx-auto">
          {stat.label}
        </p>
      </div>
    </motion.div>
  )
}

function StatsCarouselSlide({
  stats,
  isActive,
  reducedMotion,
  canTilt,
}: {
  stats: StatItem[]
  isActive: boolean
  reducedMotion: boolean
  canTilt: boolean
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
      {stats.map((stat) => (
        <StatTile
          key={stat.label}
          stat={stat}
          isActive={isActive}
          reducedMotion={reducedMotion}
          canTilt={canTilt}
        />
      ))}
    </div>
  )
}

export function Reviews() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const isLowCompute = useIsLowComputeDevice()
  const useDesktopMotion = isMobile === false && isLowCompute !== true
  const canTiltStats = useFinePointerHover()
  const sectionRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.2 })
  const [statsSlideIndex, setStatsSlideIndex] = useState(0)

  const skipScrollLinkedFade = reducedMotion === true || !useDesktopMotion

  // Scroll-driven fade: seamless transition from hero as section enters viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  })
  const sectionOpacity = useTransform(
    scrollYProgress,
    skipScrollLinkedFade ? [0, 1] : [0, 0.5],
    skipScrollLinkedFade ? [1, 1] : [0, 1]
  )

  const statsIntervalMs = useDesktopMotion
    ? STATS_CAROUSEL_INTERVAL_MS
    : STATS_CAROUSEL_INTERVAL_MOBILE_MS

  // Rotate metrics carousel when stats section is in view
  useEffect(() => {
    if (!isStatsInView || reducedMotion) return
    const id = setInterval(() => {
      setStatsSlideIndex((i) => (i + 1) % STATS_SLIDES.length)
    }, statsIntervalMs)
    return () => clearInterval(id)
  }, [isStatsInView, reducedMotion, statsIntervalMs])

  const currentStatsSlide = STATS_SLIDES[statsSlideIndex]

  return (
    <section
      ref={sectionRef}
      className="relative pt-8 sm:pt-10 pb-5 sm:pb-6 bg-muted/30 border-y border-border/50"
      aria-label="Reviews"
    >
      <motion.div style={{ opacity: sectionOpacity }}>
      <div ref={statsRef} className="container mx-auto px-4 mb-6 sm:mb-8">
        <div className="min-h-[168px] sm:min-h-[188px] md:min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={statsSlideIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full"
            >
              <StatsCarouselSlide
                stats={currentStatsSlide}
                isActive={isStatsInView}
                reducedMotion={reducedMotion === true}
                canTilt={canTiltStats}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Carousel indicators */}
        <div className="flex justify-center gap-2 mt-4" aria-hidden>
          {STATS_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStatsSlideIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ease-snap ${
                i === statsSlideIndex
                  ? "w-6 bg-foreground/80"
                  : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Show metrics set ${i + 1} of ${STATS_SLIDES.length}`}
            />
          ))}
        </div>
      </div>
      </motion.div>
    </section>
  )
}
