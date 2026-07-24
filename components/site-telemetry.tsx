"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { track } from "@vercel/analytics"
import {
  getCookieConsentAccepted,
  LUPFR_CONSENT_EVENT,
} from "@/lib/cookie-consent"

function isAdminContext(pathname: string | null): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    if (host.startsWith("admin.") || host === "admin.localhost") return true
  }
  return typeof pathname === "string" && (pathname === "/admin" || pathname.startsWith("/admin/"))
}

function sendTelemetry(body: Record<string, unknown>): void {
  const payload = JSON.stringify(body)
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" })
      navigator.sendBeacon("/api/telemetry", blob)
      return
    }
  } catch {
    // fall through
  }
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

/**
 * Consent-gated first-party impressions + CTA clicks for the admin portal.
 * Also mirrors CTA clicks to Vercel Analytics custom events when available.
 */
export function SiteTelemetry() {
  const pathname = usePathname()

  useEffect(() => {
    if (isAdminContext(pathname)) return

    const fireImpression = () => {
      if (!getCookieConsentAccepted()) return
      if (!pathname || !pathname.startsWith("/")) return
      sendTelemetry({ eventName: "page_impression", path: pathname })
      try {
        track("page_impression", { path: pathname })
      } catch {
        // Analytics may not be mounted yet
      }
    }

    if (getCookieConsentAccepted()) {
      fireImpression()
    }
    const onConsent = () => fireImpression()
    window.addEventListener(LUPFR_CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(LUPFR_CONSENT_EVENT, onConsent)
  }, [pathname])

  useEffect(() => {
    if (isAdminContext(pathname)) return

    const onClick = (event: MouseEvent) => {
      if (!getCookieConsentAccepted()) return
      const target = event.target
      if (!(target instanceof Element)) return
      const el = target.closest<HTMLElement>("[data-lupfr-track]")
      if (!el) return
      const label = el.getAttribute("data-lupfr-track") || el.textContent?.trim() || "cta"
      const href =
        el.getAttribute("href") ||
        el.closest("a")?.getAttribute("href") ||
        undefined
      const path = pathname && pathname.startsWith("/") ? pathname : "/"
      sendTelemetry({
        eventName: "cta_click",
        path,
        label: label.slice(0, 200),
        ...(href ? { href: href.slice(0, 1000) } : {}),
      })
      try {
        track("cta_click", { label: label.slice(0, 200), path })
      } catch {
        // ignore
      }
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [pathname])

  return null
}
