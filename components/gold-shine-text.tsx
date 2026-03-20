"use client"

import { motion, useScroll, useTransform } from "framer-motion"

export interface GoldShineTextProps {
  children: React.ReactNode
  /** Optional ref to drive shine from this element's scroll (e.g. section). If not set, uses global scroll. */
  scrollTargetRef?: React.RefObject<HTMLElement | null>
  /** Scroll offset when using scrollTargetRef: [startInView, endInView]. Default global: [0, 1] -> shine 50% to 100%. */
  scrollOffset?: [string, string]
  className?: string
  as?: "span" | "div"
}

/**
 * Renders text with a metallic gold gradient whose shine position is driven by scroll.
 * Uses MotionValue directly in style for smooth, scroll-synced shine (no React re-renders).
 */
export function GoldShineText({
  children,
  scrollTargetRef,
  scrollOffset = ["start start", "end start"],
  className = "",
  as: Tag = "span",
}: GoldShineTextProps) {
  const { scrollYProgress } = useScroll(
    scrollTargetRef
      ? { target: scrollTargetRef, offset: scrollOffset }
      : {}
  )

  const backgroundPosition = useTransform(
    scrollYProgress,
    [0, 1],
    ["50% 50%", "100% 50%"]
  )

  const Component = Tag === "div" ? motion.div : motion.span

  return (
    <Component
      className={`inline-block overflow-visible heading-metallic-gold-scroll gpu-accelerate ${className}`.trim()}
      style={{ backgroundPosition }}
    >
      {children}
    </Component>
  )
}
