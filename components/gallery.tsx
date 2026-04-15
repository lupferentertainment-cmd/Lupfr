"use client"

import Image from "next/image"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { GALLERY_PHOTOS } from "@/lib/data/gallery"
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
import { cn } from "@/lib/utils"

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
  const [snapCount, setSnapCount] = useState(() => GALLERY_PHOTOS.length)
  const [isPaused, setIsPaused] = useState(false)

  const eventGroups = useMemo(() => {
    const firstPhotoIndexByTitle = new Map<string, number>()
    GALLERY_PHOTOS.forEach((photo, index) => {
      if (!firstPhotoIndexByTitle.has(photo.title)) {
        firstPhotoIndexByTitle.set(photo.title, index)
      }
    })
    return Array.from(firstPhotoIndexByTitle.entries()).map(([title, firstIndex]) => ({
      title,
      firstIndex,
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

  const len = GALLERY_PHOTOS.length

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
          <p className="text-gold-accent uppercase tracking-[0.3em] text-sm sm:text-base mb-3">Moments</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            <GoldShineText scrollTargetRef={ref}>From the night</GoldShineText>
          </h2>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto md:mx-0">
            Scenes from recent nights — drag, tap, or use the arrows to browse.
          </p>
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
            <CarouselContent className="-ml-0" viewportClassName="rounded-2xl sm:rounded-3xl overflow-hidden">
              {GALLERY_PHOTOS.map((photo, i) => {
                const loadImage = isSlideInLoadRing(i, selectedIndex, len)
                /** Do not gate `priority` / `loading` on `inViewNow` — it can differ SSR vs first client paint and cause hydration mismatches on `<Image>`. */
                const isLcpCandidate = i === 0 && selectedIndex === 0 && loadImage
                return (
                  <CarouselItem
                    key={photo.id}
                    className="pl-0 basis-full"
                    style={len > 5 ? { contentVisibility: loadImage ? "visible" : "auto" } : undefined}
                  >
                    <figure className="relative w-full aspect-[16/10] bg-muted overflow-hidden rounded-2xl sm:rounded-3xl border border-border shadow-xl">
                      {loadImage ? (
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 85vw, 720px"
                          className="object-cover object-top"
                          loading={isLcpCandidate ? "eager" : "lazy"}
                          priority={isLcpCandidate}
                          fetchPriority={isLcpCandidate ? "high" : "low"}
                          decoding="async"
                          draggable={false}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-card"
                          aria-hidden
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/35 to-transparent pointer-events-none" />
                      <figcaption className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 pointer-events-none space-y-2">
                        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                          {photo.title}
                        </h3>
                        {photo.caption ? (
                          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                            {photo.caption}
                          </p>
                        ) : null}
                      </figcaption>
                    </figure>
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
            <div className="flex flex-wrap justify-center gap-2 mt-6 md:mt-7">
              {eventGroups.map((group, i) => (
                <button
                  key={`${group.title}-${group.firstIndex}`}
                  type="button"
                  aria-current={i === activeGroupIndex ? "true" : undefined}
                  aria-label={`Show event: ${group.title}`}
                  onClick={() => api?.scrollTo(group.firstIndex)}
                  className={cn(
                    "max-w-[11rem] truncate rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                    i === activeGroupIndex
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-accent/40"
                  )}
                  title={group.title}
                >
                  {group.title}
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      </ScrollReveal>
    </section>
  )
}
