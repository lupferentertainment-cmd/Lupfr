"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"

/**
 * Renders Vercel Analytics only after the page is interactive (idle or after load).
 * Defers WebSocket and script work so LCP and main-thread aren't blocked, and
 * improves back/forward cache eligibility.
 */
export function DeferredAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const schedule = () => {
      if (typeof requestIdleCallback !== "undefined") {
        const id = requestIdleCallback(
          () => setMounted(true),
          { timeout: 3500 }
        )
        return () => cancelIdleCallback(id)
      }
      const t = setTimeout(() => setMounted(true), 0)
      return () => clearTimeout(t)
    }
    return schedule()
  }, [])

  return mounted ? <Analytics /> : null
}
