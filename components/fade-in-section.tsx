"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type ReactNode } from "react"

const defaultTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }

export function FadeInSection({
  children,
  className,
  delay = 0,
  once = true,
  margin = "0px 0px 60px 0px",
}: {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
  margin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
