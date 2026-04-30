"use client"

import { useSyncExternalStore } from "react"

/** `null`: server / pre-hydration (avoid mismatch with SSR); then live `prefers-reduced-motion` snapshot. */
function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getReducedMotionSnapshot(): boolean | null {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot(): boolean | null {
  return null
}

export function useClientPrefersReducedMotion(): boolean | null {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
}
