"use client"

import { m } from "framer-motion"
import { type ReactNode } from "react"

const ease = [0.22, 1, 0.36, 1] as const

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "none"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** How much of the section (0-1) triggers "in" state. 0.2 = animate in when 20% visible. */
  amountIn?: number
  /** How much of the section (0-1) triggers "out" state when leaving. */
  amountOut?: number
  variant?: RevealVariant
  /** Stagger delay for child motion (if using staggered children). */
  stagger?: number
  /** Extra Y offset when "out" (positive = exit upward). */
  exitY?: number
  /**
   * After the block is fully revealed, keep opacity/transform stable (no fade/slide when scrolling past).
   * Use for heavy content (e.g. carousels) to avoid visible flashing.
   */
  freezeAfterReveal?: boolean
}

const DEFAULT_AMOUNT_IN = 0.2

const initialByVariant: Record<RevealVariant, Record<string, number>> = {
  up: { opacity: 0, y: 48 },
  down: { opacity: 0, y: -40 },
  left: { opacity: 0, x: -56 },
  right: { opacity: 0, x: 56 },
  scale: { opacity: 0, scale: 0.92 },
  none: { opacity: 0 },
}

const revealedByVariant: Record<RevealVariant, Record<string, number>> = {
  up: { opacity: 1, y: 0 },
  down: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  none: { opacity: 1 },
}

const revealTransition = { duration: 0.5, ease } as const

function ScrollRevealInner({
  children,
  className,
  amountIn = DEFAULT_AMOUNT_IN,
  variant = "none",
}: ScrollRevealProps) {
  return (
    <m.div
      className={className ? `gpu-accelerate ${className}` : "gpu-accelerate"}
      initial={initialByVariant[variant]}
      whileInView={revealedByVariant[variant]}
      viewport={{ once: true, amount: amountIn, margin: "0px 0px -80px 0px" }}
      transition={revealTransition}
    >
      {children}
    </m.div>
  )
}

/**
 * Scroll-driven fade + slide. Ref lives on this wrapper so useScroll measures correctly on first paint.
 * No “static SSR shell” — a plain div at full opacity then switching to opacity 0 caused a visible flash for below-fold sections.
 */
export function ScrollReveal(props: ScrollRevealProps) {
  return <ScrollRevealInner {...props} />
}

interface ScrollRevealStaggerProps {
  children: ReactNode
  className?: string
  stagger?: number
  amountIn?: number
}

/**
 * Uses whileInView so each child animates in when it enters view, and can animate out when it leaves (once: false).
 */
export function ScrollRevealStagger({
  children,
  className = "",
  stagger = 0.08,
  amountIn = 0.2,
}: ScrollRevealStaggerProps) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: amountIn, margin: "0px 0px -80px 0px" }}
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.1 } },
        hidden: {},
      }}
    >
      {children}
    </m.div>
  )
}

/* Compositor-friendly: opacity + transform only (no filter:blur - expensive) - snappy modern feel */
export const scrollRevealItemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -32, transition: { duration: 0.3 } },
}

export const scrollRevealLeftVariants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, x: 32, transition: { duration: 0.3 } },
}

export const scrollRevealRightVariants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.3 } },
}

export const scrollRevealScaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.3 } },
}
