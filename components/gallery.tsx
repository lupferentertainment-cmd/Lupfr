"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react"

import { GalleryEventBreadcrumb } from "@/components/gallery-breadcrumb"
import { SkeletonShimmerLayer } from "@/components/skeleton-shimmer-layer"
import { GALLERY_CAROUSEL_PHOTOS, type GalleryPhoto } from "@/lib/data/gallery"
import { galleryPhotoDateLabel } from "@/lib/gallery-date"
import { galleryPhotoHref, homeHistoryReplaceForGalleryBack } from "@/lib/gallery-nav"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Images } from "lucide-react"

const CAROUSEL_OPTS = {
  align: "start" as const,
  loop: true,
  containScroll: false as const,
}

const AUTOPLAY_DESKTOP_MS = 5200
const AUTOPLAY_MOBILE_MS = 7800

/** Shortest distance on a loop so we only decode images for the active slide ±1 neighbors (saves bandwidth vs mounting 15 full-size photos at once). */
function isSlideInLoadRing(i: number, selected: number, len: number): boolean {
  if (len <= 5) return true
  const d = Math.abs(i - selected)
  const circular = Math.min(d, len - d)
  return circular <= 1
}

function onGallerySlideLinkClick(e: MouseEvent<HTMLAnchorElement>): void {
  if (e.defaultPrevented) return
  if (e.button !== 0) return
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
  const replaceWith = homeHistoryReplaceForGalleryBack(window.location.pathname, window.location.hash)
  if (replaceWith !== null) {
    window.history.replaceState(window.history.state, "", replaceWith)
  }
}

function GallerySlideHitLink({
  photo,
  photoHref,
  children,
}: {
  photo: GalleryPhoto
  photoHref: string
  children?: ReactNode
}) {
  return (
    <Link
      href={photoHref}
      prefetch
      scroll
      aria-label={`Open full photo: ${photo.title}`}
      className="absolute inset-0 z-[1] block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={onGallerySlideLinkClick}
    >
      {children}
    </Link>
  )
}

/** In-ring: own `ready` state; remounts when leaving/entering the decode ring (see parent branch). */
function HomeGallerySlideDecodingImage({
  photo,
  isLcpCandidate,
  photoHref,
}: {
  photo: GalleryPhoto
  isLcpCandidate: boolean
  photoHref: string
}) {
  const [ready, setReady] = useState(false)
  return (
    <>
      <SkeletonShimmerLayer show={!ready} />
      <GallerySlideHitLink photo={photo} photoHref={photoHref}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 85vw, 720px"
          className={cn(
            "object-cover object-top",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0"
          )}
          loading={isLcpCandidate ? "eager" : "lazy"}
          priority={isLcpCandidate}
          fetchPriority={isLcpCandidate ? "high" : "low"}
          decoding="async"
          draggable={false}
          onLoad={() => setReady(true)}
        />
      </GallerySlideHitLink>
    </>
  )
}

function HomeGalleryCarouselSlide({
  photo,
  loadImage,
  isLcpCandidate,
  photoHref,
}: {
  photo: GalleryPhoto
  loadImage: boolean
  isLcpCandidate: boolean
  photoHref: string
}) {
  const slideDateLabel = galleryPhotoDateLabel(photo.dateISO)

  return (
    <figure className="relative w-full aspect-[16/10] overflow-hidden rounded-gallery-squircle border border-border/80 bg-muted shadow-xl shadow-black/[0.08] dark:shadow-black/50">
      {loadImage ? (
        <HomeGallerySlideDecodingImage
          photo={photo}
          isLcpCandidate={isLcpCandidate}
          photoHref={photoHref}
        />
      ) : (
        <>
          <SkeletonShimmerLayer show />
          <GallerySlideHitLink photo={photo} photoHref={photoHref} />
        </>
      )}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background/95 via-background/35 to-transparent pointer-events-none max-md:via-background/20" />
      <figcaption className="absolute bottom-0 left-0 right-0 z-[2] p-3 sm:p-5 md:p-8 lg:p-10 pointer-events-none space-y-1 md:space-y-2">
        <div className="hidden md:contents">
          <GalleryEventBreadcrumb folderSegments={photo.albumPathSegments} className="mb-1" />
          {slideDateLabel ? (
            <p className="text-xs font-medium tabular-nums text-muted-foreground sm:text-sm">
              {slideDateLabel}
            </p>
          ) : null}
        </div>
        <h3 className="font-serif text-base font-bold tracking-tight text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-lg md:text-2xl lg:text-3xl md:drop-shadow-none">
          {photo.title}
        </h3>
        {photo.caption ? (
          <p className="hidden md:block text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            {photo.caption}
          </p>
        ) : null}
        <p className="mt-3 hidden md:block text-sm text-muted-foreground">
          Click or tap the photo to open the full page — back returns to this section.
        </p>
      </figcaption>
    </figure>
  )
}

export function Gallery() {
  const ref = useRef<HTMLElement | null>(null)
  const inViewNow = useInView(ref, { once: false, margin: "0px 0px 80px 0px", amount: 0.15 })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (inViewNow) setHasRevealed(true)
  }, [inViewNow])
  const isRevealed = hasRevealed
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const [api, setApi] = useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(() => GALLERY_CAROUSEL_PHOTOS.length)
  const [isPaused, setIsPaused] = useState(false)

  const eventGroups = useMemo(() => {
    const firstByFolder = new Map<string, { albumBreadcrumb: string; firstIndex: number }>()
    GALLERY_CAROUSEL_PHOTOS.forEach((photo, index) => {
      if (!firstByFolder.has(photo.albumFolder)) {
        firstByFolder.set(photo.albumFolder, {
          albumBreadcrumb: photo.albumBreadcrumb,
          firstIndex: index,
        })
      }
    })
    return Array.from(firstByFolder.entries()).map(([albumFolder, v]) => ({
      albumFolder,
      label: v.albumBreadcrumb,
      firstIndex: v.firstIndex,
    }))
  }, [])

  const activeGroupIndex = useMemo(() => {
    let active = 0
    for (let i = 0; i < eventGroups.length; i += 1) {
      if (selectedIndex >= eventGroups[i].firstIndex) {
        active = i
      }
    }
    return active
  }, [eventGroups, selectedIndex])

  const len = GALLERY_CAROUSEL_PHOTOS.length

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setSnapCount(api.scrollSnapList().length)
    }
    onSelect()
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api.off("reInit", onSelect)
      api.off("select", onSelect)
    }
  }, [api])

  const autoplayMs = useMemo(() => {
    if (!api || !inViewNow || prefersReducedMotion === true || isPaused || snapCount < 2) return 0
    return isMobile === false ? AUTOPLAY_DESKTOP_MS : AUTOPLAY_MOBILE_MS
  }, [api, inViewNow, prefersReducedMotion, isPaused, snapCount, isMobile])

  useEffect(() => {
    if (!api || autoplayMs <= 0) return
    const id = globalThis.setInterval(() => {
      api.scrollNext()
    }, autoplayMs)
    return () => globalThis.clearInterval(id)
  }, [api, autoplayMs])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  if (len === 0) return null

  return (
    <section
      id="gallery"
      ref={ref}
      className="relative scroll-mt-24 sm:scroll-mt-28 overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 md:pt-16 pb-14 sm:pb-16 md:pb-20 border-y border-border/40 bg-muted/15"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <ScrollReveal variant="up" freezeAfterReveal className="container mx-auto relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-10 md:mb-12 text-center md:text-left"
        >
          <h2 className="lupfr-heading-split-leading">
            <GoldShineText scrollTargetRef={ref}>Gallery</GoldShineText>
            <br />
            <span className="lupfr-heading-subline">Event pics</span>
          </h2>
          <div className="mt-3 flex justify-center md:justify-start">
            <Button variant="outline" size="default" asChild>
              <Link
                href="/gallery"
                className="no-underline"
                title="All photos, full-screen view, and share"
              >
                <Images className="size-4 shrink-0" aria-hidden />
                View full gallery
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          onPointerEnter={pause}
          onPointerLeave={resume}
          onFocus={pause}
          onBlur={(e) => {
            const next = e.relatedTarget
            if (!next || !e.currentTarget.contains(next as Node)) resume()
          }}
          className="relative"
        >
          <Carousel opts={CAROUSEL_OPTS} className="w-full" setApi={setApi}>
            <CarouselContent className="-ml-0" viewportClassName="rounded-gallery-squircle overflow-hidden">
              {GALLERY_CAROUSEL_PHOTOS.map((photo, i) => {
                const loadImage = isSlideInLoadRing(i, selectedIndex, len)
                /** Do not gate `priority` / `loading` on `inViewNow` — it can differ SSR vs first client paint and cause hydration mismatches on `<Image>`. */
                const isLcpCandidate = i === 0 && selectedIndex === 0 && loadImage
                const photoHref = galleryPhotoHref(photo.id, "home")
                return (
                  <CarouselItem
                    key={photo.id}
                    className="pl-0 basis-full"
                    style={len > 5 ? { contentVisibility: loadImage ? "visible" : "auto" } : undefined}
                  >
                    <HomeGalleryCarouselSlide
                      photo={photo}
                      loadImage={loadImage}
                      isLcpCandidate={isLcpCandidate}
                      photoHref={photoHref}
                    />
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious
              type="button"
              variant="outline"
              className="left-2 sm:left-4 top-1/2 -translate-y-1/2 border-border/80 bg-background/85 backdrop-blur-sm shadow-md"
            />
            <CarouselNext
              type="button"
              variant="outline"
              className="right-2 sm:right-4 top-1/2 -translate-y-1/2 border-border/80 bg-background/85 backdrop-blur-sm shadow-md"
            />
          </Carousel>

          {eventGroups.length > 0 ? (
            <div
              className="mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:mt-7"
              role="navigation"
              aria-label="Jump to event album"
            >
              {eventGroups.map((group, i) => (
                <button
                  key={group.albumFolder}
                  type="button"
                  aria-current={i === activeGroupIndex ? "true" : undefined}
                  aria-label={`Show album: ${group.label}`}
                  onClick={() => api?.scrollTo(group.firstIndex)}
                  className={cn(
                    "max-w-[14rem] truncate rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                    i === activeGroupIndex
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-accent/40"
                  )}
                  title={group.label}
                >
                  {group.label}
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      </ScrollReveal>
    </section>
  )
}
