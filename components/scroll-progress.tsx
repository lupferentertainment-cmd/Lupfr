"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] rounded-r-full"
      style={{
        scaleX,
        background: "linear-gradient(90deg, oklch(0.72 0.14 88), oklch(0.9 0.08 90))",
        boxShadow: "0 0 12px oklch(0.72 0.14 88 / 0.5)",
      }}
    />
  )
}
