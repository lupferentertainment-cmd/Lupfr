"use client"

import { motion, useScroll, useTransform } from "framer-motion"

const motionByTag = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  div: motion.div,
  span: motion.span,
} as const

export type GoldShineTextAs = keyof typeof motionByTag

export interface GoldShineTextProps {
  children: React.ReactNode
  /** Optional ref to drive shine from this element's scroll (e.g. section). If not set, uses global scroll. */
  scrollTargetRef?: React.RefObject<HTMLElement | null>
  /** Scroll offset when using scrollTargetRef: [startInView, endInView]. Default global: [0, 1] -> shine 50% to 100%. */
  scrollOffset?: [string, string]
  className?: string
  /** Use `h1`–`h4` to render the shine on the heading (no extra wrapper). Default `span` for inline or inside an existing heading. */
  as?: GoldShineTextAs
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
  as = "span",
}: GoldShineTextProps) {
  const { scrollYProgress } = useScroll(
    scrollTargetRef
      ? {
          target: scrollTargetRef,
          offset: scrollOffset,
          /* Parent section ref is attached after child layout effects (Strict Mode / streaming); useEffect avoids Framer ref warning. */
          layoutEffect: false,
        }
      : {}
  )

  const backgroundPosition = useTransform(
    scrollYProgress,
    [0, 1],
    ["50% 50%", "100% 50%"]
  )

  const MotionComponent = motionByTag[as]
  /** `span` stays inline-level for copy like footers and mid-paragraph brand names; headings must be block so stacked titles wrap lines. */
  const flowClass = as === "span" ? "inline-block" : "block"

  return (
    <MotionComponent
      className={`${flowClass} overflow-visible heading-metallic-gold gold-shine-text gpu-accelerate ${className}`.trim()}
      style={{ backgroundPosition }}
    >
      {children}
    </MotionComponent>
  )
}
