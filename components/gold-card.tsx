"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

import { cn } from "@/lib/utils"

// Same tilt range as events/artists/services/about: ±6deg, snappy spring
const TILT_SPRING = { stiffness: 420, damping: 32 }
const CARD_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Shared event-card shell: squircle (`rounded-sm sm:rounded-md`), `bg-card`
 * surface, gold accent border + soft gold wash on hover, ±6° tilt on pointer
 * devices, and the staggered rise-in reveal. Visuals match the Events cards
 * so any section can reuse the same card language (Team uses it today).
 */
export function GoldCard({
  index = 0,
  isRevealed,
  enableTilt = true,
  tiltMaxDeg = 6,
  className,
  children,
}: {
  /** Position in the grid — drives the stagger delay of the reveal. */
  index?: number
  /** Reveal gate, usually a `useInView` result on the section. */
  isRevealed: boolean
  /** Disable on touch devices (pass `!isMobile`); tilt is pointer-only. */
  enableTilt?: boolean
  /** Lean strength in degrees (events use 6; pass more for a pronounced lean). */
  tiltMaxDeg?: number
  className?: string
  children: ReactNode
}) {
  const cardRef = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltMaxDeg, -tiltMaxDeg]), TILT_SPRING)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltMaxDeg, tiltMaxDeg]), TILT_SPRING)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enableTilt || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    if (!enableTilt) return
    x.set(0)
    y.set(0)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: CARD_EASE }}
      className={cn(
        "group relative overflow-hidden rounded-sm sm:rounded-md bg-card border border-border",
        "hover:border-accent/60 transition-[border-color,box-shadow] duration-200 ease-out shadow-xl",
        "hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_0_28px_rgba(168,130,52,0.28)]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      style={enableTilt ? { rotateX, rotateY, transformPerspective: 800 } : { rotateX: 0, rotateY: 0 }}
    >
      {children}
      {/* Gold wash on hover — the "shine through" layer, same as the Events cards */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none rounded-sm sm:rounded-md bg-accent/5",
          "opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-200"
        )}
        aria-hidden
      />
      {/* Gold glint: diagonal sheen sweeps across the card on hover */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm sm:rounded-md"
        aria-hidden
      >
        <div
          className={cn(
            "absolute inset-y-[-40%] -left-full w-1/2 rotate-12",
            "bg-gradient-to-r from-transparent via-accent/20 to-transparent",
            "opacity-0 group-hover:opacity-100 group-hover:translate-x-[300%]",
            "motion-safe:transition-[transform,opacity] motion-safe:duration-700 motion-safe:ease-out",
            "motion-reduce:hidden"
          )}
        />
      </div>
    </motion.article>
  )
}
