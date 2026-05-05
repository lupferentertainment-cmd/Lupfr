"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { GalleryEventBreadcrumb } from "@/components/gallery-breadcrumb"
import { GalleryShareRow } from "@/components/gallery-share-row"
import type { GalleryPhoto } from "@/lib/data/gallery"
import { galleryPhotoDateLabel } from "@/lib/gallery-date"
import {
  GALLERY_SLIDING_PRELOAD_RADIUS,
  galleryCircularPreloadIndices,
} from "@/lib/gallery-nav"
import { SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

const MAX_W = 1600
const MAX_H = 1000
/** Masonry: eager-load only the first N thumbnails (above-the-fold / first row on desktop). */
const MASONRY_PRIORITY_COUNT = 4

export type GalleryLightboxProps = {
  photos: readonly GalleryPhoto[]
  open: boolean
  index: number
  onOpenChange: (open: boolean) => void
  onIndexChange: (index: number) => void
}

export function GalleryLightbox({
  photos,
  open,
  index,
  onOpenChange,
  onIndexChange,
}: GalleryLightboxProps) {
  const photo = photos[index] ?? photos[0]
  const shareUrl = photo ? `${SITE_URL}/gallery/p/${photo.id}` : SITE_URL
  const shareTitle = photo ? `LUPFR — ${photo.title}` : "LUPFR — Gallery"

  const preloadIndices = useMemo(
    () =>
      open
        ? galleryCircularPreloadIndices(photos.length, index, GALLERY_SLIDING_PRELOAD_RADIUS)
        : [],
    [open, photos.length, index]
  )

  const currentId = photo.id
  const [decodedId, setDecodedId] = useState<number | null>(null)
  const currentDecoded = decodedId === currentId

  const goPrev = useCallback(() => {
    if (photos.length === 0) return
    onIndexChange(index <= 0 ? photos.length - 1 : index - 1)
  }, [index, onIndexChange, photos.length])

  const goNext = useCallback(() => {
    if (photos.length === 0) return
    onIndexChange(index >= photos.length - 1 ? 0 : index + 1)
  }, [index, onIndexChange, photos.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, goPrev, goNext])

  if (!photo) return null

  const lightboxDate = galleryPhotoDateLabel(photo.dateISO)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[100dvh] w-[min(100vw-1rem,1200px)] max-w-[100vw] translate-x-[-50%] translate-y-[-50%] overflow-y-auto overflow-x-hidden border-border bg-background/95 p-0 shadow-2xl sm:max-w-[min(100vw-2rem,1200px)] !rounded-[var(--lupfr-gallery-squircle-radius)]"
      >
        <DialogTitle className="sr-only">
          {photo.title} — photo {index + 1} of {photos.length}
        </DialogTitle>
        <div className="relative border-b border-border bg-black/5 dark:bg-white/5">
          <div className="absolute right-2 top-2 z-20 flex flex-wrap justify-end gap-1">
            <Link
              href={`/gallery/p/${photo.id}`}
              className="rounded-md bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow backdrop-blur hover:bg-accent/20"
            >
              Open page
            </Link>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex size-10 items-center justify-center rounded-md bg-card/90 text-foreground shadow backdrop-blur hover:bg-accent/20"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow backdrop-blur hover:bg-accent/20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 shadow backdrop-blur hover:bg-accent/20"
                aria-label="Next photo"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          ) : null}
          <div className="relative aspect-[16/10] w-full min-h-[200px] overflow-hidden bg-muted/40">
            {open && preloadIndices.length > 0
              ? preloadIndices.map((pi) => {
                  const p = photos[pi]
                  if (!p) return null
                  return (
                    <Image
                      key={`lb-preload-${p.id}`}
                      src={p.src}
                      alt=""
                      width={MAX_W}
                      height={MAX_H}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                      loading="eager"
                      fetchPriority="low"
                      decoding="async"
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain object-center opacity-0"
                    />
                  )
                })
              : null}
            <div
              className={cn(
                "skeleton-shimmer pointer-events-none absolute inset-0 z-[1]",
                "transition-opacity duration-300 ease-out motion-reduce:transition-none",
                currentDecoded ? "opacity-0" : "opacity-100"
              )}
              aria-hidden
            />
            <Image
              key={currentId}
              src={photo.src}
              alt={photo.alt}
              width={MAX_W}
              height={MAX_H}
              sizes="(max-width: 1200px) 100vw, 1200px"
              className={cn(
                "absolute inset-0 z-[2] h-full w-full object-contain object-center",
                "transition-opacity duration-300 ease-out motion-reduce:transition-none",
                currentDecoded ? "opacity-100" : "opacity-0"
              )}
              priority={open}
              loading={open ? "eager" : "lazy"}
              fetchPriority={open ? "high" : "low"}
              decoding="async"
              onLoad={() => setDecodedId(currentId)}
            />
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <div>
            <GalleryEventBreadcrumb folderSegments={photo.albumPathSegments} className="mb-2" />
            <p className="text-gold-accent text-xs font-semibold tracking-tight">LUPFR</p>
            <h2 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">{photo.title}</h2>
            {lightboxDate ? (
              <p className="text-muted-foreground mt-1 text-sm font-medium tabular-nums">{lightboxDate}</p>
            ) : null}
            {photo.caption ? (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{photo.caption}</p>
            ) : null}
            <p className="text-muted-foreground/80 mt-2 text-xs">
              {index + 1} of {photos.length} — arrow keys to browse
            </p>
          </div>
          <GalleryShareRow shareUrl={shareUrl} shareTitle={shareTitle} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function GalleryMasonryClient({ photos, className }: { photos: GalleryPhoto[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const openAt = (i: number) => {
    setIndex(i)
    setOpen(true)
  }

  return (
    <>
      <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {photos.map((p, i) => {
          const eagerThumb = i < MASONRY_PRIORITY_COUNT
          return (
            <MasonryThumb
              key={p.id}
              photo={p}
              eagerThumb={eagerThumb}
              fetchPriority={i < 2 ? "high" : "low"}
              onOpen={() => openAt(i)}
            />
          )
        })}
      </div>
      <GalleryLightbox
        photos={photos}
        open={open}
        index={index}
        onOpenChange={setOpen}
        onIndexChange={setIndex}
      />
    </>
  )
}

function MasonryThumb({
  photo,
  eagerThumb,
  fetchPriority,
  onOpen,
}: {
  photo: GalleryPhoto
  eagerThumb: boolean
  fetchPriority: "high" | "low"
  onOpen: () => void
}) {
  const [thumbReady, setThumbReady] = useState(false)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-gallery-squircle bg-muted text-left ring-1 ring-inset ring-border/55 shadow-md shadow-black/[0.07] transition-[box-shadow,transform] duration-500 ease-snap motion-reduce:duration-200 hover:shadow-xl hover:shadow-black/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-black/35 dark:hover:shadow-black/50"
    >
      <div
        className={cn(
          "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
          "motion-safe:transition-opacity motion-safe:duration-300 motion-safe:ease-out",
          "motion-reduce:transition-none",
          thumbReady ? "opacity-0" : "opacity-100"
        )}
        aria-hidden
      />
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={eagerThumb}
        loading={eagerThumb ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={() => setThumbReady(true)}
        className={cn(
          "z-[1] rounded-gallery-squircle object-cover object-center transition duration-500 ease-snap motion-reduce:transition-none group-hover:scale-[1.04] motion-reduce:group-hover:scale-100",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          thumbReady ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-3 sm:opacity-0 sm:group-hover:opacity-100">
        <p className="line-clamp-2 text-sm font-medium text-foreground drop-shadow md:line-clamp-1">
          {photo.caption || photo.title}
        </p>
      </div>
    </button>
  )
}
