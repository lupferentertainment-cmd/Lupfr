"use client"

import { m, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState, type ReactNode } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { TextReveal } from "@/components/text-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { useIsMobile } from "@/hooks/use-mobile"
import { getServices, type ServiceItem } from "@/lib/data/services"

const CARD_STAGGER = 0.08
const SPRING_PUNCH = { type: "spring" as const, stiffness: 500, damping: 26 }
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 550, damping: 30 }

// Same tilt range as events/artists: ±6deg, snappy spring
const TILT_SPRING = { stiffness: 420, damping: 32 }
// Deeper perspective so cards read more 3D
const CARD_PERSPECTIVE = 1200

const services = getServices()

function ServiceCardTiltShell({
  children,
  onHover,
  onLeave,
  className,
  initial,
  animate,
  transition,
}: {
  children: ReactNode
  onHover: () => void
  onLeave: () => void
  className: string
  initial: { opacity: number; y: number; scale: number }
  animate: { opacity: number; y: number; scale: number }
  transition: { type: "spring"; stiffness: number; damping: number; delay: number }
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
    onLeave()
  }

  return (
    <m.article
      ref={cardRef}
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: CARD_PERSPECTIVE }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </m.article>
  )
}

const CARD_REST_SHADOW =
  "0 1px 2px rgba(0,0,0,0.06), 0 12px 32px -12px rgba(0,0,0,0.18)"
const CARD_ACTIVE_SHADOW =
  "0 0 0 1px rgba(184, 148, 58, 0.2), 0 20px 40px -12px rgba(168, 132, 48, 0.25), 0 0 64px -16px rgba(150, 118, 42, 0.2)"

function ServiceCardStaticBody({ service }: { service: ServiceItem }) {
  return (
    <>
      {/* Floating shadow layer for depth — resting values (mobile has no hover lift) */}
      <div
        className="absolute inset-x-2 top-4 bottom-0 rounded-2xl bg-black/8 dark:bg-black/25 blur-2xl pointer-events-none opacity-[0.35] scale-[0.96]"
        aria-hidden
      />
      <div
        className="relative p-8 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 h-full overflow-hidden"
        style={{ boxShadow: CARD_REST_SHADOW }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent rounded-t-2xl pointer-events-none" aria-hidden />

        <div className="w-12 h-12 rounded-xl bg-secondary/80 dark:bg-secondary/60 flex items-center justify-center mb-5 group-hover:bg-accent/90 dark:group-hover:bg-accent/85 transition-colors duration-200 ease-snap">
          <service.icon
            size={24}
            className="text-foreground group-hover:text-accent-foreground dark:group-hover:text-accent transition-colors duration-200 ease-snap"
          />
        </div>

        <h3 className="text-lg font-semibold tracking-tight mb-2.5 group-hover:text-accent dark:group-hover:text-accent transition-colors">
          {service.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {service.description}
        </p>

        <ul className="space-y-1.5">
          {service.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 opacity-[0.85]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function ServiceCardMotionBody({
  service,
  isActive,
}: {
  service: ServiceItem
  isActive: boolean
}) {
  return (
    <>
      {/* Floating shadow layer for depth */}
      <m.div
        className="absolute inset-x-2 top-4 bottom-0 rounded-2xl bg-black/8 dark:bg-black/25 blur-2xl pointer-events-none"
        animate={{
          opacity: isActive ? 0.5 : 0.35,
          scale: isActive ? 0.98 : 0.96,
        }}
        transition={SPRING_SNAPPY}
        aria-hidden
      />
      <m.div
        className="relative p-8 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 h-full overflow-hidden"
        animate={{
          boxShadow: isActive ? CARD_ACTIVE_SHADOW : CARD_REST_SHADOW,
          y: isActive ? -6 : 0,
        }}
        transition={SPRING_SNAPPY}
      >
        {/* Subtle top-edge highlight for raised surface feel */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent rounded-t-2xl pointer-events-none" aria-hidden />

        <m.div
          className="w-12 h-12 rounded-xl bg-secondary/80 dark:bg-secondary/60 flex items-center justify-center mb-5 group-hover:bg-accent/90 dark:group-hover:bg-accent/85 transition-colors duration-200 ease-snap"
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
          transition={SPRING_PUNCH}
        >
          <service.icon
            size={24}
            className="text-foreground group-hover:text-accent-foreground dark:group-hover:text-accent transition-colors duration-200 ease-snap"
          />
        </m.div>

        <m.h3
          className="text-lg font-semibold tracking-tight mb-2.5 group-hover:text-accent dark:group-hover:text-accent transition-colors"
          animate={{ scale: isActive ? 1.01 : 1 }}
          transition={SPRING_SNAPPY}
        >
          {service.title}
        </m.h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {service.description}
        </p>

        <ul className="space-y-1.5">
          {service.features.map((feature, fi) => (
            <m.li
              key={feature}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <m.span
                className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
                animate={{
                  scale: isActive ? 1.2 : 1,
                  opacity: isActive ? 1 : 0.85,
                }}
                transition={{
                  scale: { duration: 0.35, delay: fi * 0.04 },
                  opacity: { duration: 0.2 },
                }}
              />
              {feature}
            </m.li>
          ))}
        </ul>

        <m.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent rounded-b-2xl origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={SPRING_SNAPPY}
        />
      </m.div>
    </>
  )
}

function ServiceCard({
  service,
  index,
  isInView,
  enableTilt,
  activeIndex,
  setActiveIndex,
}: {
  service: ServiceItem
  index: number
  isInView: boolean
  enableTilt: boolean
  activeIndex: number | null
  setActiveIndex: (i: number | null) => void
}) {
  const className = "group relative pt-2"

  // Mobile / unresolved: plain DOM card — no per-feature m.li or shell motion nodes.
  if (!enableTilt) {
    return (
      <article className={className}>
        <ServiceCardStaticBody service={service} />
      </article>
    )
  }

  const isActive = activeIndex === index
  const initial = { opacity: 0, y: 24, scale: 0.96 }
  const animate = isInView
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 24, scale: 0.96 }
  const transition = { ...SPRING_PUNCH, delay: 0.12 + index * CARD_STAGGER }
  const onHover = () => setActiveIndex(index)
  const onLeave = () => setActiveIndex(null)

  return (
    <ServiceCardTiltShell
      onHover={onHover}
      onLeave={onLeave}
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <ServiceCardMotionBody service={service} isActive={isActive} />
    </ServiceCardTiltShell>
  )
}

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isMobile = useIsMobile()
  // Only animate infinite orbs on confirmed desktop; mobile/unresolved get static ambience.
  const animateOrbs = isMobile === false
  // Tilt springs only on confirmed desktop; mobile/unresolved skip the tilt shell entirely.
  const enableTilt = isMobile === false

  return (
    <section
      id="services"
      ref={ref}
      className="relative [overflow-x:clip] py-14 sm:py-16 md:py-20 px-4 sm:px-6"
    >
      {/* Background orbs — infinite pulse on desktop only */}
      {animateOrbs ? (
        <>
          <m.div
            className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[200px]"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <m.div
            className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[150px]"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[200px] opacity-40"
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[150px] opacity-30 scale-110"
            aria-hidden
          />
        </>
      )}

      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-7xl relative z-10">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...SPRING_SNAPPY, delay: 0.1 }}
          className="text-center mb-10 sm:mb-12 md:mb-14"
        >
          <m.p
            className="text-gold-accent tracking-tight text-sm mb-4"
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.05 }}
          >
            What We Do
          </m.p>
          <m.h2
            className="mb-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.12 }}
          >
            <GoldShineText scrollTargetRef={ref}>Our Services</GoldShineText>
          </m.h2>
          <TextReveal
            text="From intimate bar takeovers to large-scale productions, we bring the music culture to life across SF & LA."
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
            delay={0.2}
          />
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={i}
              isInView={isInView}
              enableTilt={enableTilt}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </div>

      </ScrollReveal>
    </section>
  )
}
