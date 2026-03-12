"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Music, Users, Mic2, PartyPopper, Building2, Sparkles } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"

const COUNT_UP_DURATION_MS = 1200
const CARD_STAGGER = 0.08
const SPRING_PUNCH = { type: "spring" as const, stiffness: 400, damping: 22 }
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 500, damping: 28 }

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function CountUp({
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

const services = [
  {
    icon: PartyPopper,
    title: "Owned Events",
    description: "Our signature branded experiences—from Boiler Boat to Rooftop Grooves. We handle everything: venue, talent, production, and promotion.",
    features: ["Full Production", "Curated Lineups", "Premium Venues", "Marketing & Promotion"],
  },
  {
    icon: Mic2,
    title: "Talent Booking",
    description: "Connect with the right artists through our extensive network. We source, negotiate, and coordinate talent for your events.",
    features: ["Artist Discovery", "Contract Negotiation", "Schedule Coordination", "On-Site Management"],
  },
  {
    icon: Building2,
    title: "Venue Programming",
    description: "We curate regular music programming for venues looking to elevate their nightlife presence with consistent, quality entertainment.",
    features: ["Monthly DJ Nights", "Music Curation", "Event Management", "Audience Development"],
  },
  {
    icon: Users,
    title: "Private Events",
    description: "From corporate gatherings to luxury celebrations, we bring the same energy and attention to detail to every private event.",
    features: ["Custom Concepts", "Full Service", "Premium Sound", "Exclusive Access"],
  },
  {
    icon: Music,
    title: "Event Production",
    description: "End-to-end production services for venues and brands. We bring the vision, crew, and execution to make it happen.",
    features: ["Sound & Lighting", "Staging & Decor", "Vendor Management", "Day-Of Coordination"],
  },
  {
    icon: Sparkles,
    title: "Brand Partnerships",
    description: "Collaborate with us on activations that reach the SF nightlife community through our events and platform.",
    features: ["Event Sponsorships", "Brand Activations", "Content Creation", "Influencer Access"],
  },
]

export function Services() {
  const ref = useRef(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.1 })
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const countUpTrigger = isInView || isStatsInView

  return (
    <section id="services" ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Animated background orbs - subtle pulse */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[200px]"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[150px]"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...SPRING_SNAPPY, delay: 0.1 }}
          className="text-center mb-20"
        >
          <motion.p
            className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4"
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.05 }}
          >
            What We Do
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.12 }}
          >
            <span className="inline-block heading-metallic-gold">Our Services</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING_SNAPPY, delay: 0.22 }}
          >
            From intimate bar takeovers to large-scale productions, we bring house music culture to life across San Francisco.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 32, scale: 0.94, filter: "blur(8px)" }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                  : { opacity: 0, y: 32, scale: 0.94, filter: "blur(8px)" }
              }
              transition={{ ...SPRING_PUNCH, delay: 0.2 + i * CARD_STAGGER }}
              className="group relative"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div
                className="relative p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-colors duration-300 h-full overflow-hidden"
                animate={{
                  boxShadow:
                    activeIndex === i
                      ? "0 0 0 1px oklch(0.72 0.14 88 / 0.25), 0 24px 48px -12px oklch(0.72 0.14 88 / 0.2), 0 0 60px -10px oklch(0.72 0.14 88 / 0.15)"
                      : "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
                transition={SPRING_SNAPPY}
              >
                {/* Icon - bounce on hover */}
                <motion.div
                  className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent transition-colors duration-300"
                  animate={{
                    rotate: activeIndex === i ? 360 : 0,
                    scale: activeIndex === i ? 1.1 : 1,
                    y: activeIndex === i ? [0, -8, 0] : 0,
                  }}
                  transition={{
                    rotate: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    scale: SPRING_PUNCH,
                    y: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <service.icon
                    size={28}
                    className="text-foreground group-hover:text-accent-foreground transition-colors"
                  />
                </motion.div>

                {/* Content */}
                <motion.h3
                  className="text-xl font-bold tracking-tight mb-3 group-hover:text-accent transition-colors"
                  animate={{ scale: activeIndex === i ? 1.02 : 1 }}
                  transition={SPRING_SNAPPY}
                >
                  {service.title}
                </motion.h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features - bullet pulse on hover */}
                <ul className="space-y-2">
                  {service.features.map((feature, fi) => (
                    <motion.li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                        animate={{
                          scale: activeIndex === i ? [1, 1.3, 1] : 1,
                          opacity: activeIndex === i ? 1 : 0.8,
                        }}
                        transition={{
                          scale: { duration: 0.5, delay: fi * 0.06 },
                          opacity: { duration: 0.2 },
                        }}
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* Hover line - snappy reveal */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-b-2xl origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeIndex === i ? 1 : 0 }}
                  transition={SPRING_SNAPPY}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats - pop in with beat stagger */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...SPRING_PUNCH, delay: 0.55 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { end: 50, suffix: "+", label: "Events Hosted" },
            { end: 100, suffix: "+", label: "Artists Booked" },
            { end: 10, suffix: "K+", label: "Happy Attendees" },
            { end: 15, suffix: "+", label: "Venue Partners" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center group/stat"
              initial={{ opacity: 0, scale: 0.5, y: 16 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ ...SPRING_PUNCH, delay: 0.65 + i * CARD_STAGGER }}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2 tabular-nums tracking-tight">
                <CountUp
                  end={stat.end}
                  suffix={stat.suffix}
                  isInView={countUpTrigger}
                />
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </ScrollReveal>
    </section>
  )
}
