"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** Delay before showing shimmer so fast loads never flash (see `--lupfr-skeleton-shimmer-show-delay`). */
const SHIMMER_SHOW_DELAY_MS = 200

type SkeletonShimmerLayerProps = {
  /** `false` after the real image has fired `onLoad`, or for empty slots that should not show shimmer. */
  show: boolean
  className?: string
  zIndexClassName?: string
}

/**
 * Global photo-card loading skin from `app/globals.css` (`.skeleton-shimmer`).
 * Place as an `absolute inset-0` layer under `next/image` or an empty card frame.
 * Visibility is delayed ~200ms after `show` becomes true so fast loads never flash;
 * when `show` is false, the layer hides immediately.
 */
export function SkeletonShimmerLayer({
  show,
  className,
  zIndexClassName = "z-0",
}: SkeletonShimmerLayerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setVisible(false)
      return
    }
    const id = window.setTimeout(() => {
      setVisible(true)
    }, SHIMMER_SHOW_DELAY_MS)
    return () => {
      window.clearTimeout(id)
    }
  }, [show])

  return (
    <div
      className={cn(
        "skeleton-shimmer pointer-events-none absolute inset-0",
        zIndexClassName,
        "motion-safe:transition-opacity motion-safe:duration-300",
        "motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      aria-hidden
    />
  )
}
