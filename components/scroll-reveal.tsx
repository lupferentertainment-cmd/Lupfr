"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

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
}

const DEFAULT_AMOUNT_IN = 0.2
const DEFAULT_AMOUNT_OUT = 0.8

function ScrollRevealInner({
  children,
  className,
  amountIn = DEFAULT_AMOUNT_IN,
  amountOut = DEFAULT_AMOUNT_OUT,
  variant,
  exitY,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const initialY = variant === "up" ? 48 : variant === "down" ? -40 : 0
  const initialX = variant === "left" ? -56 : variant === "right" ? 56 : 0
  const exitX = variant === "left" ? 32 : variant === "right" ? -32 : 0

  const inputRange = [0, amountIn, 0.5, amountOut, 1] as const
  const opacity = useTransform(scrollYProgress, inputRange, [0, 1, 1, 1, 0])
  const y = useTransform(
    scrollYProgress,
    inputRange,
    [initialY, 0, 0, exitY ?? 0, exitY ?? 0]
  )
  const x = useTransform(
    scrollYProgress,
    inputRange,
    [initialX, 0, 0, exitX, exitX]
  )
  const scale = useTransform(
    scrollYProgress,
    inputRange,
    [variant === "scale" ? 0.92 : 1, 1, 1, variant === "scale" ? 0.96 : 1, variant === "scale" ? 0.96 : 1]
  )

  const style: Record<string, unknown> = { opacity }
  if (variant === "left" || variant === "right") style.x = x
  else style.y = y
  if (variant === "scale") style.scale = scale

  return (
    <motion.div ref={ref} className={className ? `gpu-accelerate ${className}` : "gpu-accelerate"} style={style}>
      {children}
    </motion.div>
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
    <motion.div
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
    </motion.div>
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
