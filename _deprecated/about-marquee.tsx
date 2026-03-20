/**
 * ARCHIVED: About section horizontal text marquee (service phrases + bullets).
 * Previously rendered at the bottom of `components/about.tsx` after the values grid.
 * Not imported anywhere. To restore: import `AboutMarqueeArchive` in About and pass `isInView`.
 */

"use client"

import { motion } from "framer-motion"

export const ABOUT_MARQUEE_ITEMS = [
  "BOAT PARTIES",
  "ROOFTOP SESSIONS",
  "WAREHOUSE EVENTS",
  "PRIVATE EXPERIENCES",
  "TALENT BOOKING",
  "VENUE PROGRAMMING",
] as const

export function AboutMarqueeArchive({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-20 sm:mt-24 md:mt-32 overflow-hidden"
    >
      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center">
            {ABOUT_MARQUEE_ITEMS.map((item) => (
              <span
                key={`${i}-${item}`}
                className="font-serif mx-4 sm:mx-6 md:mx-8 text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-foreground tracking-tighter"
              >
                {item}
                <span className="mx-8 text-foreground">•</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
