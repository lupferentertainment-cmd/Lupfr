"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

type EventDetailHeroImageProps = {
  src: string
  alt: string
  width: number
  height: number
  sizes: string
  unoptimized?: boolean
}

/**
 * Event detail poster: gold skeleton shimmer under the image until decode.
 */
export function EventDetailHeroImage({
  src,
  alt,
  width,
  height,
  sizes,
  unoptimized,
}: EventDetailHeroImageProps) {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden bg-muted/30 px-3 py-6 sm:px-5 sm:py-10">
      <div
        className={cn(
          "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          ready ? "opacity-0" : "opacity-100"
        )}
        aria-hidden
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority
        unoptimized={unoptimized}
        onLoad={() => setReady(true)}
        className={cn(
          "relative z-[1] h-auto max-h-[min(88vh,2000px)] w-auto max-w-full object-contain",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )
}
