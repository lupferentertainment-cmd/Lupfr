"use client"

import Image from "next/image"
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { MapPin } from "lucide-react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { getTeam, type TeamMember } from "@/lib/data/team"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const TEAM_IMAGE_SIZE = 800
const CARD_EASE = [0.22, 1, 0.36, 1] as const

// Same tilt range as events/artists/services/about: ±6deg, snappy spring
const TILT_SPRING = { stiffness: 420, damping: 32 }

const team = getTeam()

function TeamCard({
  member,
  index,
  isInView,
  isMobile,
  isExpanded,
  onToggle,
}: {
  member: TeamMember
  index: number
  isInView: boolean
  isMobile: boolean | undefined
  isExpanded: boolean
  onToggle: () => void
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [imageReady, setImageReady] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), TILT_SPRING)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), TILT_SPRING)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    x.set(0)
    y.set(0)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.1, ease: CARD_EASE }}
      className="group relative overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ease-snap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isMobile ? undefined : { rotateX, rotateY, transformPerspective: 800 }}
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
          aria-controls={`team-bio-${index}`}
          id={`team-bio-trigger-${index}`}
        >
          {/* Portraits are pre-designed 800x800 cards (name/title baked into the artwork),
              so no gradient overlay and no big name repeated directly under the image. */}
          <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-muted">
            <div
              className={cn(
                "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
                "motion-safe:transition-opacity motion-safe:duration-300",
                "motion-reduce:transition-none",
                imageReady ? "opacity-0" : "opacity-100"
              )}
              aria-hidden
            />
            <Image
              src={member.image}
              alt={`${member.name}, ${member.title}`}
              width={TEAM_IMAGE_SIZE}
              height={TEAM_IMAGE_SIZE}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              onLoad={() => setImageReady(true)}
              className={cn(
                "relative z-[1] w-full h-full object-cover",
                "motion-safe:transition-opacity motion-safe:duration-300 motion-reduce:transition-none",
                "motion-safe:group-hover:scale-[1.03] motion-safe:transition-[opacity,transform] motion-safe:duration-500",
                imageReady ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-accent shrink-0" aria-hidden />
              <span className="text-xs tracking-normal text-muted-foreground">{member.location}</span>
            </div>
            <h3
              className={cn(
                "text-lg md:text-xl font-bold tracking-tight transition-colors duration-200 ease-snap",
                isExpanded ? "text-accent" : "text-foreground group-hover:text-accent/90"
              )}
            >
              {member.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{member.title}</p>
            <motion.span
              className="mt-3 inline-flex items-center gap-2 text-sm text-accent/80"
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <span className="tracking-normal">{isExpanded ? "Less" : "More"}</span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                ▼
              </motion.span>
            </motion.span>
          </div>
        </motion.button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              id={`team-bio-${index}`}
              role="region"
              aria-labelledby={`team-bio-trigger-${index}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.18 } }}
              className="overflow-hidden border-t border-border/80"
            >
              <div className="px-4 py-4 md:px-5 md:py-5 bg-muted/30">
                <p className="text-muted-foreground leading-relaxed text-sm">{member.bio}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  )
}

export function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })
  const isMobile = useIsMobile()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section
      id="team"
      ref={ref}
      className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden"
    >
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-7xl relative z-10">
        <p className="text-gold-accent tracking-tight text-sm mb-4">Who We Are</p>
        <h2 className="lupfr-heading--compact lupfr-heading-stack">
          <GoldShineText scrollTargetRef={ref}>Our</GoldShineText>
          <br />
          <span className="lupfr-heading-subline">Team</span>
        </h2>

        {/* items-start: an expanded bio must not stretch the neighboring cards.
            4-up on desktop keeps the cards compact (artists-card scale), 2-up tablet, 1-up phones. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
          {team.map((member, i) => (
            <TeamCard
              key={member.name}
              member={member}
              index={i}
              isInView={isInView}
              isMobile={isMobile}
              isExpanded={expandedIndex === i}
              onToggle={() => setExpandedIndex((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
