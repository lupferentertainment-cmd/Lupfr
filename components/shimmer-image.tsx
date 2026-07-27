"use client"

import Image, { type ImageProps } from "next/image"
import { useCallback, useState } from "react"
import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import { cn } from "@/lib/utils"

type ShimmerImageProps = Omit<ImageProps, "onLoad">

/** `next/image` with the site's delayed gold shimmer underlay and decode fade. */
export function ShimmerImage({ className, style, ...props }: ShimmerImageProps) {
  const [ready, setReady] = useState(false)

  /**
   * A browser-cached image can finish decoding before React attaches `onLoad`,
   * which would leave it stuck at `opacity: 0` behind the shimmer forever
   * (seen live on the /brands deck viewer, whose slides mount on click). Read
   * `complete` on mount so an already-decoded image reveals immediately.
   */
  const revealIfDecoded = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) setReady(true)
  }, [])

  return (
    <>
      <SkeletonShimmerLayer show={!ready} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- ImageProps requires alt; it is forwarded through props. */}
      <Image
        {...props}
        ref={revealIfDecoded}
        className={cn(
          "motion-safe:transition-opacity motion-safe:duration-500 motion-reduce:transition-none",
          className
        )}
        style={ready ? style : { ...style, opacity: 0 }}
        onLoad={() => setReady(true)}
      />
    </>
  )
}
