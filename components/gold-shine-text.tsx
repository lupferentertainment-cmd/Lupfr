"use client"

import { useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { useState } from "react"

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
 * Reusable: use for any heading or phrase where the gold "bar" should move as the user scrolls.
 */
export function GoldShineText({
  children,
  scrollTargetRef,
  scrollOffset = ["start start", "end start"],
  className = "",
  as: Tag = "span",
}: GoldShineTextProps) {
  const [shinePosition, setShinePosition] = useState("50%")

  const { scrollYProgress } = useScroll(
    scrollTargetRef
      ? { target: scrollTargetRef, offset: scrollOffset }
      : {}
  )

  const scrollShine = useTransform(
    scrollYProgress,
    [0, 1],
    [50, 100]
  )

  useMotionValueEvent(scrollShine, "change", (v) => {
    setShinePosition(`${Number(v).toFixed(1)}%`)
  })

  return (
    <Tag
      className={`inline-block heading-metallic-gold-scroll ${className}`.trim()}
      style={{ ["--scroll-shine" as string]: shinePosition }}
    >
      {children}
    </Tag>
  )
}
