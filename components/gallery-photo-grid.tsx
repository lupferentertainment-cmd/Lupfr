"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import type { GalleryPhoto } from "@/lib/data/gallery"
import { groupGalleryByDateISO } from "@/lib/gallery-date"
import type { GalleryFrom } from "@/lib/gallery-nav"
import { galleryPhotoHref } from "@/lib/gallery-nav"
import { cn } from "@/lib/utils"

const PRIORITY_COUNT = 6

function GridTileImage({
  photo,
  eager,
  fetchPriority,
}: {
  photo: GalleryPhoto
  eager: boolean
  fetchPriority: "high" | "low"
}) {
  const [ready, setReady] = useState(false)
  return (
    <>
      <div
        className={cn(
          "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
          "motion-safe:transition-opacity motion-safe:duration-500 motion-safe:ease-snap",
          "motion-reduce:transition-opacity motion-reduce:duration-200",
          ready ? "opacity-0" : "opacity-100"
        )}
        aria-hidden
      />
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "z-[1] rounded-gallery-squircle object-cover object-center transform-gpu",
          "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-snap motion-safe:group-hover:scale-[1.04]",
          "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          ready ? "opacity-100" : "opacity-0"
        )}
        loading={eager ? "eager" : "lazy"}
        priority={eager}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={() => setReady(true)}
      />
    </>
  )
}

function headingId(sortKey: string): string {
  return `gallery-heading-${sortKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`
}

/**
 * Full gallery index (`/gallery`): link grid with prefetch. Client boundary for thumb fade-in.
 * Navigating to `/gallery/p/[id]?from=gallery` makes browser Back return here without a modal.
 */
export function GalleryPhotoGrid({
  photos,
  className,
  linkFrom = "gallery",
  /** When true (default), photos are grouped under Apple-style date headings. Set false under home album blocks that already show the date in the section title. */
  dateSections = true,
}: {
  photos: readonly GalleryPhoto[]
  className?: string
  /** `gallery` = from `/gallery` index; `home` = from `#gallery` on the home page (album blocks / same origin). */
  linkFrom?: GalleryFrom
  dateSections?: boolean
}) {
  let photoIndex = 0

  const renderTile = (p: GalleryPhoto) => {
    const i = photoIndex++
    const eager = i < PRIORITY_COUNT
    return (
      <Link
        key={p.id}
        href={galleryPhotoHref(p.id, linkFrom)}
        prefetch
        scroll
        className={cn(
          "group relative isolate aspect-square w-full cursor-zoom-in overflow-hidden rounded-gallery-squircle",
          "bg-muted text-left ring-1 ring-inset ring-border/55",
          "shadow-md shadow-black/[0.07] dark:shadow-black/35",
          "transition-[box-shadow,transform] duration-500 ease-snap [content-visibility:auto] motion-reduce:duration-200",
          "hover:shadow-xl hover:shadow-black/[0.12] dark:hover:shadow-black/50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <GridTileImage photo={p} eager={eager} fetchPriority={eager ? "high" : "low"} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/15 to-transparent opacity-0 transition-opacity duration-300 ease-snap group-hover:opacity-100" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-3 sm:opacity-0 sm:group-hover:opacity-100">
          <p className="line-clamp-2 text-sm font-medium text-foreground drop-shadow md:line-clamp-1">
            {p.caption || p.title}
          </p>
        </div>
      </Link>
    )
  }

  if (!dateSections) {
    photoIndex = 0
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3",
          className
        )}
      >
        {photos.map((p) => renderTile(p))}
      </div>
    )
  }

  const groups = groupGalleryByDateISO([...photos])
  photoIndex = 0

  return (
    <div className={cn("space-y-12 sm:space-y-14", className)}>
      {groups.map((g) => (
        <section
          key={g.sortKey}
          className="scroll-mt-28"
          aria-labelledby={headingId(g.sortKey)}
        >
          <h2
            id={headingId(g.sortKey)}
            className="mb-4 font-sans text-lg font-semibold tracking-tight text-foreground tabular-nums sm:text-xl"
          >
            {g.heading}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {g.items.map((p) => renderTile(p))}
          </div>
        </section>
      ))}
    </div>
  )
}
