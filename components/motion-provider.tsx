"use client"

import { LazyMotion, domAnimation } from "framer-motion"
import type { ReactNode } from "react"

/**
 * App-wide LazyMotion ancestor so shared `m.*` primitives load the lighter
 * `domAnimation` feature set on the critical path (non-strict).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}
