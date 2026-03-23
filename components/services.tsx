"use client"

import Image from "next/image"
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { getPartners } from "@/lib/data/partners"
import { getServices, type ServiceItem } from "@/lib/data/services"
import { cn } from "@/lib/utils"

const CARD_STAGGER = 0.08
const SPRING_PUNCH = { type: "spring" as const, stiffness: 500, damping: 26 }
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 550, damping: 30 }

// Same tilt range as events/artists: ±6deg, snappy spring
const TILT_SPRING = { stiffness: 420, damping: 32 }
// Deeper perspective so cards read more 3D
const CARD_PERSPECTIVE = 1200

const services = getServices()
const partners = getPartners()

function ServiceCard({
  service,
  index,
  isInView,
  activeIndex,
  setActiveIndex,
}: {
  service: ServiceItem
  index: number
  isInView: boolean
  activeIndex: number | null
  setActiveIndex: (i: number | null) => void
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
    setActiveIndex(null)
  }

  const isActive = activeIndex === index
  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 24, scale: 0.96 }
      }
      transition={{ ...SPRING_PUNCH, delay: 0.12 + index * CARD_STAGGER }}
      className="group relative pt-2"
      onMouseEnter={() => setActiveIndex(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: CARD_PERSPECTIVE }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Floating shadow layer for depth */}
      <motion.div
        className="absolute inset-x-2 top-4 bottom-0 rounded-2xl bg-black/8 dark:bg-black/25 blur-2xl pointer-events-none"
        animate={{
          opacity: isActive ? 0.5 : 0.35,
          scale: isActive ? 0.98 : 0.96,
        }}
        transition={SPRING_SNAPPY}
        aria-hidden
      />
      <motion.div
        className="relative p-8 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 h-full overflow-hidden"
        animate={{
          boxShadow: isActive
            ? "0 0 0 1px rgba(184, 148, 58, 0.2), 0 20px 40px -12px rgba(168, 132, 48, 0.25), 0 0 64px -16px rgba(150, 118, 42, 0.2)"
            : "0 1px 2px rgba(0,0,0,0.06), 0 12px 32px -12px rgba(0,0,0,0.18)",
          y: isActive ? -6 : 0,
        }}
        transition={SPRING_SNAPPY}
      >
        {/* Subtle top-edge highlight for raised surface feel */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent rounded-t-2xl pointer-events-none" aria-hidden />

        <motion.div
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
        </motion.div>

        <motion.h3
          className="text-lg font-semibold tracking-tight mb-2.5 group-hover:text-accent dark:group-hover:text-accent transition-colors"
          animate={{ scale: isActive ? 1.01 : 1 }}
          transition={SPRING_SNAPPY}
        >
          {service.title}
        </motion.h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {service.description}
        </p>

        <ul className="space-y-1.5">
          {service.features.map((feature, fi) => (
            <motion.li
              key={feature}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <motion.span
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
            </motion.li>
          ))}
        </ul>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent rounded-b-2xl origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={SPRING_SNAPPY}
        />
      </motion.div>
    </motion.article>
  )
}

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section
      id="services"
      ref={ref}
      className="relative overflow-x-hidden py-20 sm:py-24 md:py-32 px-4 sm:px-6"
    >
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
          className="text-center mb-12 sm:mb-16 md:mb-20"
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
            className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.12 }}
          >
            <GoldShineText scrollTargetRef={ref}>Our Services</GoldShineText>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING_SNAPPY, delay: 0.22 }}
          >
            From intimate bar takeovers to large-scale productions, we bring the music culture to life across San Francisco.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, i) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={i}
              isInView={isInView}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </div>

        {/* Corporate partners - same title style as Featured Artists / Culture Meets Production; no strip background */}
        <div className="mt-20 scroll-mt-8 pt-2 sm:mt-24 md:mt-32">
          <p className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4">
            Partners
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-10 sm:mb-12 md:mb-14 leading-[1.08]">
            <GoldShineText scrollTargetRef={ref}>Corporate</GoldShineText>
            <br />
            <span className="text-muted-foreground">Partners</span>
          </h2>
          <div
            className={cn(
              "mx-auto grid max-w-5xl grid-cols-2 place-items-center gap-x-8 gap-y-10",
              "sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 md:gap-x-8 lg:gap-x-10"
            )}
          >
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full",
                  "size-28 sm:size-32 md:size-36 lg:size-40"
                )}
                aria-label={p.ariaLabel ?? p.name}
              >
                <div
                  className={cn(
                    "partner-logo-chip flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-full border-2 border-border/75 bg-card p-3 transition-transform duration-200 ease-snap sm:p-4 md:p-4 lg:p-5",
                    "dark:border-border/90 dark:bg-card group-hover:scale-[1.03]"
                  )}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={512}
                    height={512}
                    sizes="(max-width: 640px) 7rem, (max-width: 1024px) 8rem, 10rem"
                    className={p.imageClassName}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
