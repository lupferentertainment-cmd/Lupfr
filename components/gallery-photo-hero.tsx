"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export type GalleryPhotoHeroProps = {
  src: string
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
  /** Eager hidden loads so prev/next navigations are warm (deduped). */
  preloadSrcs?: readonly string[]
}

/**
 * Full-bleed gallery hero with muted skeleton, opacity fade after decode, and
 * optional sliding-window preloads for adjacent photo URLs.
 */
export function GalleryPhotoHero({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  preloadSrcs = [],
}: GalleryPhotoHeroProps) {
  const [decodedSrc, setDecodedSrc] = useState<string | null>(null)
  /** Stale `decodedSrc` from a prior `src` keeps `ready` false until the current image completes. */
  const ready = decodedSrc === src

  const uniquePreloads = useMemo(() => [...new Set(preloadSrcs.filter((s) => s && s !== src))], [preloadSrcs, src])

  return (
    <div className="relative mx-auto w-full max-w-full">
      {/*
        Fixed aspect + max-height so the block below the frame (title, caption) does not
        reflow when the main image decodes. Same 8/5 as gallery lightbox.
      */}
      <div
        className={cn(
          "relative aspect-[8/5] w-full max-h-[min(82dvh,92vh,1200px)] min-h-0",
          "overflow-hidden rounded-gallery-squircle"
        )}
      >
        {uniquePreloads.map((preloadSrc) => (
          <Image
            key={preloadSrc}
            src={preloadSrc}
            alt=""
            width={width}
            height={height}
            sizes={sizes}
            loading="eager"
            fetchPriority="low"
            decoding="async"
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain object-center opacity-0"
          />
        ))}
        <div
          className={cn(
            "skeleton-shimmer pointer-events-none absolute inset-0 z-[1]",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            ready ? "opacity-0" : "opacity-100"
          )}
          aria-hidden
        />
        <Image
          key={src}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority
          fetchPriority="high"
          decoding="async"
          onLoadingComplete={() => setDecodedSrc(src)}
          className={cn(
            "absolute inset-0 z-[2] h-full w-full object-contain object-center",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0",
            className
          )}
        />
      </div>
    </div>
  )
}
