"use client"

import { motion, useScroll } from "framer-motion"

import { useIsMobile } from "@/hooks/use-mobile"

/** Separate so `useScroll` is not subscribed on phones (saves scroll-linked work per frame). */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] rounded-r-full pointer-events-none"
      style={{
        scaleX: scrollYProgress,
        background: "linear-gradient(90deg, #d4a84b, #f0e6b8)",
        boxShadow: "0 0 12px rgba(212, 168, 75, 0.5)",
      }}
    />
  )
}

export function ScrollProgress() {
  const isMobile = useIsMobile()
  /* Hide until we know desktop — avoids bar flash on mobile and SSR/hydration mismatch. */
  if (isMobile !== false) {
    return null
  }
  return <ScrollProgressBar />
}
