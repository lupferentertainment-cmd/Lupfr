"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import { cn } from "@/lib/utils"

type ShimmerImageProps = Omit<ImageProps, "onLoad">

/** `next/image` with the site's delayed gold shimmer underlay and decode fade. */
export function ShimmerImage({ className, style, ...props }: ShimmerImageProps) {
  const [ready, setReady] = useState(false)

  return (
    <>
      <SkeletonShimmerLayer show={!ready} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- ImageProps requires alt; it is forwarded through props. */}
      <Image
        {...props}
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
