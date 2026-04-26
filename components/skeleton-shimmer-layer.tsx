"use client"

import { cn } from "@/lib/utils"

type SkeletonShimmerLayerProps = {
  /** `false` after the real image has fired `onLoadingComplete`, or for empty slots that should not show shimmer. */
  show: boolean
  className?: string
  zIndexClassName?: string
}

/**
 * Global photo-card loading skin from `app/globals.css` (`.skeleton-shimmer`).
 * Place as an `absolute inset-0` layer under `next/image` or an empty card frame.
 */
export function SkeletonShimmerLayer({
  show,
  className,
  zIndexClassName = "z-0",
}: SkeletonShimmerLayerProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer pointer-events-none absolute inset-0",
        zIndexClassName,
        "motion-safe:transition-opacity motion-safe:duration-300",
        "motion-reduce:transition-none",
        show ? "opacity-100" : "opacity-0",
        className
      )}
      aria-hidden
    />
  )
}
