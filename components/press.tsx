"use client"

import { memo, useRef, useState } from "react"
import Image from "next/image"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { ArrowUpRight, Newspaper } from "lucide-react"
import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { getPress, type PressItem } from "@/lib/data/press"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const PRESS_IMAGE_WIDTH = 1200
const PRESS_IMAGE_HEIGHT = 600
const PRESS_PER_DESKTOP_SLIDE = 2

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

/** "2026-06-10" -> "Jun 10, 2026" (deterministic, no locale/timezone drift). */
function fmtDate(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number)
  return `${MONTH_NAMES[(month ?? 1) - 1]} ${day}, ${year}`
}

function getDesktopPressSlides(items: PressItem[]): PressItem[][] {
  const count = Math.ceil(items.length / PRESS_PER_DESKTOP_SLIDE)
  return Array.from({ length: count }, (_, i) =>
    items.slice(i * PRESS_PER_DESKTOP_SLIDE, (i + 1) * PRESS_PER_DESKTOP_SLIDE)
  )
}

const press = getPress()
const desktopPressSlides = getDesktopPressSlides(press)
const mobilePressSlides = press.map((p) => [p])

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236b7280'/%3E%3Cstop offset='100%25' style='stop-color:%234b5563'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='48'%3EPress%3C/text%3E%3C/svg%3E"

const PressCard = memo(function PressCard({
  item,
  isMobile,
}: {
  item: PressItem
  isMobile: boolean
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [imageError, setImageError] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 420, damping: 32 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 420, damping: 32 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) / rect.width)
    y.set((e.clientY - (rect.top + rect.height / 2)) / rect.height)
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      x.set(0)
      y.set(0)
    }
    setIsHovered(false)
  }

  return (
    <motion.article
      ref={cardRef}
      className="group relative h-full rounded-sm bg-card overflow-hidden"
      onMouseEnter={isMobile ? undefined : () => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={isMobile ? undefined : { rotateX, rotateY, transformPerspective: 800 }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read "${item.title}" on ${item.outlet}`}
        className="flex h-full flex-col rounded-sm overflow-hidden"
      >
        <motion.div
          className="relative aspect-[2/1] w-full overflow-hidden rounded-t-sm bg-muted"
          animate={{ scale: isHovered ? 1.03 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {!imageError ? (
            <div
              className={cn(
                "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
                "motion-safe:transition-opacity motion-safe:duration-300",
                "motion-reduce:transition-none",
                imageReady ? "opacity-0" : "opacity-100"
              )}
              aria-hidden
            />
          ) : null}
          {imageError ? (
            <Image
              src={FALLBACK_IMAGE}
              alt={`${item.outlet} feature on LUPFR`}
              width={PRESS_IMAGE_WIDTH}
              height={PRESS_IMAGE_HEIGHT}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={item.image}
              alt={`${item.outlet} feature on LUPFR`}
              width={PRESS_IMAGE_WIDTH}
              height={PRESS_IMAGE_HEIGHT}
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className={cn(
                "relative z-[1] w-full h-full object-cover",
                "motion-safe:transition-opacity motion-safe:duration-300",
                "motion-reduce:transition-none",
                imageReady ? "opacity-100" : "opacity-0"
              )}
              onError={() => setImageError(true)}
              onLoad={() => setImageReady(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-70 pointer-events-none" />
          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold tracking-tight rounded-full bg-muted/90 text-foreground backdrop-blur-sm">
            {item.category}
          </span>
        </motion.div>

        <div className="flex flex-1 flex-col p-4 md:p-5 rounded-b-sm bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={14} className="text-accent shrink-0" />
            <span className="text-xs tracking-normal text-muted-foreground">
              {item.outlet} · {fmtDate(item.dateISO)}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground text-balance">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {item.excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight text-accent">
            Read the article
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </a>
    </motion.article>
  )
})

function PressCarousel({ isMobile }: { isMobile: boolean }) {
  const slides = isMobile ? mobilePressSlides : desktopPressSlides

  return (
    <Carousel opts={{ align: "start", containScroll: "trimSnaps" }} className="w-full">
      <CarouselContent className="-ml-4 md:-ml-6" viewportClassName="py-2 md:py-3">
        {slides.map((slide) => (
          <CarouselItem key={slide.map((item) => item.id).join("-")} className="pl-4 md:pl-6 basis-full">
            {isMobile ? (
              <PressCard item={slide[0]} isMobile={isMobile} />
            ) : (
              <div
                className={cn(
                  "grid grid-cols-1 gap-4 sm:gap-6",
                  press.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-3xl mx-auto"
                )}
              >
                {slide.map((item) => (
                  <PressCard
                    key={item.id}
                    item={item}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      {slides.length > 1 ? <CarouselPrevious className="left-1 top-[45%] sm:-left-4 lg:-left-10" /> : null}
      {slides.length > 1 ? <CarouselNext className="right-1 top-[45%] sm:-right-4 lg:-right-10" /> : null}
      <CarouselDots />
    </Carousel>
  )
}

export function Press() {
  const ref = useRef(null)
  const isMobile = useIsMobile() ?? true

  /* Editorial / news coverage about LUPFR, carousel of clickable article cards. */
  return (
    <section
      id="news"
      ref={ref}
      className="pt-14 sm:pt-16 md:pt-20 pb-8 sm:pb-9 md:pb-11 px-4 sm:px-6 relative overflow-hidden"
      aria-labelledby="news-section-title"
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        <ScrollReveal variant="up" className="mb-10 sm:mb-12 md:mb-14">
          <p
            id="news-section-title"
            className="lupfr-section-kicker mb-4"
          >
            The Story · Editorials &amp; Press
          </p>
          <h2 className="lupfr-heading-split-leading">
            <GoldShineText scrollTargetRef={ref}>News</GoldShineText>
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="up" freezeAfterReveal>
          <PressCarousel isMobile={isMobile} />
        </ScrollReveal>
      </div>
    </section>
  )
}
