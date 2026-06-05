"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {
  getCookieConsentAccepted,
  LUPFR_CONSENT_EVENT,
} from "@/lib/cookie-consent"

/**
 * Renders Vercel Analytics only after cookie consent, then after idle/timeout
 * (defers work for LCP / bfcache). Without consent, analytics does not load.
 */
export function DeferredAnalytics() {
  const [consent, setConsent] = useState(false)
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    const timeoutId = getCookieConsentAccepted()
      ? window.setTimeout(() => setConsent(true), 0)
      : null
    const onConsent = () => {
      setConsent(true)
    }
    window.addEventListener(LUPFR_CONSENT_EVENT, onConsent)
    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId)
      window.removeEventListener(LUPFR_CONSENT_EVENT, onConsent)
    }
  }, [])

  useEffect(() => {
    if (!consent) return
    const schedule = () => {
      if (typeof requestIdleCallback !== "undefined") {
        const id = requestIdleCallback(
          () => setIdle(true),
          { timeout: 3500 }
        )
        return () => cancelIdleCallback(id)
      }
      const t = setTimeout(() => setIdle(true), 0)
      return () => clearTimeout(t)
    }
    return schedule()
  }, [consent])

  if (!consent || !idle) return null
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
