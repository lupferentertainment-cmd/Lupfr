"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  getEscapeBackHref,
  isDocumentBlockingEscapeBack,
  isEscapeBackFormFieldTarget,
} from "@/lib/escape-back"

/**
 * Listens for Escape and routes to the same destination as the page’s
 * primary back link (see `getEscapeBackHref`), unless a dialog, nav drawer,
 * or phone-list overlay is open.
 */
export function EscapeBack() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof pathname === "string" && (pathname === "/admin" || pathname.startsWith("/admin/"))) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (e.defaultPrevented) return
      if (typeof document === "undefined") return
      if (isDocumentBlockingEscapeBack(document)) return
      if (isEscapeBackFormFieldTarget(e.target)) return

      const search = window.location.search ?? ""
      const href = getEscapeBackHref(pathname, search)
      if (href === null) return
      e.preventDefault()
      router.push(href)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pathname, router])

  return null
}
