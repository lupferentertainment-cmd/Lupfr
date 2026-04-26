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

export type GoldShineVariant = "scroll" | "static"

export interface GoldShineTextProps {
  children: React.ReactNode
  /** Optional ref to drive shine from this element's scroll (e.g. section). If not set, uses global scroll. */
  scrollTargetRef?: React.RefObject<HTMLElement | null>
  /** Scroll offset when using scrollTargetRef: [startInView, endInView]. Default global: [0, 1] -> shine 50% to 100%. */
  scrollOffset?: [string, string]
  className?: string
  /** Use `h1`–`h4` to render the shine on the heading (no extra wrapper). Default `span` for inline or inside an existing heading. */
  as?: GoldShineTextAs
  /**
   * `scroll` (default): shine follows scroll via Framer `useScroll`.
   * `static`: fixed gradient position — use on mobile hero copy to avoid an extra scroll subscription.
   */
  variant?: GoldShineVariant
}

function GoldShineTextStatic({
  className = "",
  as = "span",
  children,
}: Pick<GoldShineTextProps, "className" | "as" | "children">) {
  const MotionComponent = motionByTag[as]

  return (
    <MotionComponent
      className={`heading-metallic-gold gold-shine-text gpu-accelerate ${className}`.trim()}
      style={{ backgroundPosition: "50% 50%" }}
    >
      {children}
    </MotionComponent>
  )
}

function GoldShineTextScroll({
  children,
  scrollTargetRef,
  scrollOffset = ["start start", "end start"],
  className = "",
  as = "span",
}: Omit<GoldShineTextProps, "variant">) {
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

  return (
    <MotionComponent
      className={`heading-metallic-gold gold-shine-text gpu-accelerate ${className}`.trim()}
      style={{ backgroundPosition }}
    >
      {children}
    </MotionComponent>
  )
}

/**
 * Renders text with a metallic gold gradient; by default the shine position is driven by scroll.
 * Uses MotionValue directly in style for smooth, scroll-synced shine (no React re-renders).
 */
export function GoldShineText({
  variant = "scroll",
  ...props
}: GoldShineTextProps) {
  if (variant === "static") {
    return (
      <GoldShineTextStatic as={props.as} className={props.className}>
        {props.children}
      </GoldShineTextStatic>
    )
  }
  return <GoldShineTextScroll {...props} />
}
