"use client"

import { motion, useScroll } from "framer-motion"

import { useIsMobile } from "@/hooks/use-mobile"

export function ScrollProgress() {
  const isMobile = useIsMobile()
  const { scrollYProgress } = useScroll()

  if (isMobile === true) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] rounded-r-full"
      style={{
        scaleX: scrollYProgress,
        background: "linear-gradient(90deg, #d4a84b, #f0e6b8)",
        boxShadow: "0 0 12px rgba(212, 168, 75, 0.5)",
      }}
    />
  )
}
