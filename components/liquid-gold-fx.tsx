"use client"

import { type ReactNode } from "react"
import { useTheme } from "next-themes"
import { MetalFx } from "metal-fx"

import { useIsMobile } from "@/hooks/use-mobile"
import { useClientPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

/**
 * Memoized WebGL feature check. metal-fx throws ("WebGL not supported") rather than
 * degrading when no GL context is available (WebGL-disabled desktop browsers, some
 * GPUs/VMs, and the jsdom test environment), so we detect up front and fall back to the
 * plain child. Returns false on the server (no `document`). Only ever evaluated on the
 * client after `useIsMobile()` resolves, so it never causes a hydration mismatch.
 */
let webglSupported: boolean | null = null
function supportsWebGL(): boolean {
  if (webglSupported !== null) return webglSupported
  if (typeof document === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    webglSupported = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    webglSupported = false
  }
  return webglSupported
}

/**
 * Liquid-gold metallic ring (metal-fx `gold` preset) around a single interactive
 * element — used on key CTAs, the team filter chips, and the team / featured-artist
 * cards.
 *
 * **Performance guard (DESIGN.md "Mobile performance" + "flicker avoidance"):** the
 * WebGL effect mounts ONLY once `useIsMobile()` has resolved to `false` (≥768px) AND
 * `prefers-reduced-motion` is not set. Server render, pre-hydration, phones/tablets,
 * and reduced-motion users all get the plain child with zero WebGL — so this never
 * touches the mobile LCP budget and is SSR-safe (renders identical markup to the
 * server until the desktop client confirms). metal-fx itself shares one GL context +
 * one RAF loop across every instance and pauses offscreen via IntersectionObserver.
 *
 * The wrapped child stays fully interactive (the ring canvas is `pointer-events:none`).
 * Because the ring is a static overlay sized to the element's box, any host card must
 * disable its pointer tilt while ringed or the ring will desync from the rotation.
 */
export function LiquidGoldFx({
  variant = "button",
  strength,
  className,
  children,
}: {
  /** metal-fx variant: `button` (pill ring) or `circle`. */
  variant?: "button" | "circle"
  /** Ring opacity 0..1 (metal-fx default 1). */
  strength?: number
  /** Class passed to the metal-fx wrapper div (layout only; ignored when guarded off). */
  className?: string
  children: ReactNode
}) {
  const isMobile = useIsMobile()
  const reducedMotion = useClientPrefersReducedMotion()
  const { resolvedTheme } = useTheme()

  // Only mount WebGL once we've confirmed desktop + motion-ok + GL available.
  // undefined/null → off (server, pre-hydration, mobile, reduced-motion, no-WebGL).
  const active = isMobile === false && reducedMotion === false && supportsWebGL()
  if (!active) return <>{children}</>

  return (
    <MetalFx
      variant={variant}
      preset="gold"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      strength={strength}
      className={className}
    >
      {children}
    </MetalFx>
  )
}

/**
 * Whether the liquid-gold ring is currently active for this viewport — host cards use
 * this to turn OFF their pointer tilt while ringed (see `LiquidGoldFx` note). Mirrors
 * the exact guard above so the two never disagree.
 */
export function useLiquidGoldActive(): boolean {
  const isMobile = useIsMobile()
  const reducedMotion = useClientPrefersReducedMotion()
  return isMobile === false && reducedMotion === false && supportsWebGL()
}
