"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { GALLERY_ITEMS, type GalleryItem } from "@/lib/gallery"
import { cn } from "@/lib/utils"

const GALLERY_W = 1600
const GALLERY_H = 1000
const AUTOPLAY_MS = 5200

const CAROUSEL_OPTS = {
  loop: true as const,
  align: "start" as const,
  containScroll: false as const,
}

function GallerySlide({
  item,
  index,
  isRevealed,
  active,
}: {
  item: GalleryItem
  index: number
  isRevealed: boolean
  active: boolean
}) {
  const eager = index === 0
  return (
    <figure className="relative m-0 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-muted shadow-xl">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={item.src}
          alt={item.alt}
          width={GALLERY_W}
          height={GALLERY_H}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, min(1120px, 88vw)"
          priority={eager}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "low"}
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/95 via-card/25 to-transparent" />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
          <motion.div
            initial={false}
            animate={
              isRevealed && active
                ? { opacity: 1, y: 0 }
                : { opacity: isRevealed ? 0.88 : 0, y: 8 }
            }
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-gold-accent mb-1 text-xs font-semibold uppercase tracking-[0.25em] sm:text-sm">
              {item.caption}
            </p>
            <p className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {item.title}
            </p>
          </motion.div>
        </figcaption>
      </div>
    </figure>
  )
}

export function GallerySection() {
  const items = GALLERY_ITEMS
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: false, margin: "0px 0px 100px 0px", amount: 0.15 })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (inView) setHasRevealed(true)
  }, [inView])
  const isRevealed = hasRevealed

  const [api, setApi] = useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!api) return
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setSnapCount(api.scrollSnapList().length)
    }
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || prefersReducedMotion || snapCount < 2) return
    const id = window.setInterval(() => {
      api.scrollNext()
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [api, prefersReducedMotion, snapCount])

  const scrollTo = useCallback(
    (i: number) => {
      api?.scrollTo(i)
    },
    [api]
  )

  if (items.length === 0) return null

  return (
    <section
      id="gallery"
      ref={ref}
      className="relative overflow-visible px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 md:pb-28 md:pt-14 lg:px-8 lg:pb-32 lg:pt-16"
      aria-label="Photo gallery"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <ScrollReveal variant="up" freezeAfterReveal className="container relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-10"
        >
          <p className="text-gold-accent mb-3 text-sm font-medium uppercase tracking-[0.3em] sm:text-base">
            On the floor
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            <GoldShineText scrollTargetRef={ref}>Moments</GoldShineText>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-base sm:text-lg">
            Rotating scenes from recent nights — drag or use arrows to browse.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Carousel opts={CAROUSEL_OPTS} className="w-full" setApi={setApi}>
            <CarouselContent className="-ml-0" viewportClassName="overflow-visible py-1">
              {items.map((item, i) => (
                <CarouselItem key={item.slug} className="basis-full pl-0">
                  <GallerySlide
                    item={item}
                    index={i}
                    isRevealed={isRevealed}
                    active={i === selectedIndex}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              type="button"
              variant="outline"
              className="left-1 top-1/2 z-20 size-10 -translate-y-1/2 border-border bg-card/90 shadow-md backdrop-blur-sm sm:left-2 md:-left-4 md:size-11"
            />
            <CarouselNext
              type="button"
              variant="outline"
              className="right-1 top-1/2 z-20 size-10 -translate-y-1/2 border-border bg-card/90 shadow-md backdrop-blur-sm sm:right-2 md:-right-4 md:size-11"
            />
          </Carousel>

          {snapCount > 1 ? (
            <div className="mt-6 flex flex-wrap justify-center gap-2.5" role="tablist" aria-label="Gallery slides">
              {Array.from({ length: snapCount }).map((_, i) => (
                <button
                  key={items[i]?.slug ?? i}
                  type="button"
                  role="tab"
                  aria-selected={i === selectedIndex}
                  onClick={() => scrollTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-200 ease-out",
                    i === selectedIndex ? "w-8 bg-foreground/80" : "w-2 bg-foreground/30 hover:bg-foreground/50"
                  )}
                  aria-label={`Show photo ${i + 1} of ${snapCount}: ${items[i]?.title ?? ""}`}
                />
              ))}
            </div>
          ) : null}
        </motion.div>
      </ScrollReveal>
    </section>
  )
}
