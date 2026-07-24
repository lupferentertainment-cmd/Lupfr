"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

/**
 * Warm the `/` RSC + JS chunks while the user is on a subpage so “home” navigations
 * (logo, back links, Escape) feel instant after the first paint.
 */
export function PrefetchHomeRoute() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === "/") return
    if (
      window.location.hostname.startsWith("admin.") ||
      window.location.hostname === "admin.localhost" ||
      (typeof pathname === "string" &&
        (pathname === "/admin" || pathname.startsWith("/admin/")))
    ) {
      return
    }
    router.prefetch("/")
  }, [pathname, router])

  return null
}
