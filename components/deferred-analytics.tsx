"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
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
    if (getCookieConsentAccepted()) setConsent(true)
    const onConsent = () => {
      setConsent(true)
    }
    window.addEventListener(LUPFR_CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(LUPFR_CONSENT_EVENT, onConsent)
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

  return consent && idle ? <Analytics /> : null
}
