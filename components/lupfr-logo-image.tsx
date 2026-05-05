"use client"

import Image from "next/image"
import { useState } from "react"

import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import { cn } from "@/lib/utils"

const LOGO_SRC = "/logos/will_logo.png"

type LupfrLogoImageProps = {
  width: number
  height: number
  sizes: string
  className?: string
  /** Applied after load (e.g. `opacity-95` on 404). Default `opacity-100`. */
  readyClassName?: string
  priority?: boolean
  alt?: string
}

/**
 * LUPFR wordmark with the same gold skeleton underlay as photo cards until decode.
 */
export function LupfrLogoImage({
  width,
  height,
  sizes,
  className,
  readyClassName = "opacity-100",
  priority,
  alt = "LUPFR",
}: LupfrLogoImageProps) {
  const [ready, setReady] = useState(false)
  return (
    <span className="relative inline-block">
      <SkeletonShimmerLayer show={!ready} className="rounded-md" />
      <Image
        src={LOGO_SRC}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        onLoad={() => setReady(true)}
        className={cn(
          "relative z-[1]",
          "motion-safe:transition-opacity motion-safe:duration-300",
          "motion-reduce:transition-none",
          ready ? readyClassName : "opacity-0",
          className
        )}
      />
    </span>
  )
}
