"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { m, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState, useEffect, useCallback, type ReactNode, type RefObject } from "react"
import { Calendar, MapPin, Clock, Instagram, ExternalLink } from "lucide-react"
import { eventDetailPath, getUpcomingEvents, getPastEvents, getEventTag, type EventItem } from "@/lib/events"
import { getReels } from "@/lib/data/reels"
import { LINKS } from "@/lib/links"
import { useEventCalendarClock } from "@/hooks/use-event-calendar-clock"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { EventDetailLink } from "@/components/event-detail-link"
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const EVENT_IMAGE_WIDTH = 1200
const EVENT_IMAGE_HEIGHT = 800

/** Tilt springs live here so EventCard never creates them on touch/mobile. */
function EventCardTiltShell({
  children,
  onHover,
  onLeave,
  className,
  initial,
  animate,
  transition,
}: {
  children: ReactNode
  onHover: () => void
  onLeave: () => void
  className: string
  initial: { opacity: number; y: number }
  animate: { opacity: number; y: number }
  transition: { duration: number; delay: number; ease: number[] }
}) {
  const cardRef = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 420, damping: 32 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 420, damping: 32 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    onLeave()
  }

  return (
    <m.article
      ref={cardRef}
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
    </m.article>
  )
}

function EventCard({
  event,
  index,
  prioritizeImage,
  isRevealed,
  enableTilt,
  staticInner,
  isHovered,
  onHover,
  onLeave,
  now,
  shineSectionRef,
}: {
  event: EventItem
  index: number
  prioritizeImage: boolean
  isRevealed: boolean
  enableTilt: boolean
  /** Mobile/touch: skip hover-only motion nodes that never fire. */
  staticInner: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  now: Date
  shineSectionRef: RefObject<HTMLElement | null>
}) {
  const [imageReady, setImageReady] = useState(false)
  const tag = getEventTag(event, now)

  const isFirstCard = index === 0
  const initial = isFirstCard ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
  const animate = isRevealed
    ? { opacity: 1, y: 0 }
    : { opacity: isFirstCard ? 1 : 0, y: isFirstCard ? 0 : 40 }
  const transition = {
    duration: 0.45,
    delay: isFirstCard ? 0 : index * 0.08,
    ease: [0.22, 1, 0.36, 1],
  }
  const className =
    "group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-accent/50 transition-[border-color] duration-150 ease-out shadow-xl flex flex-col h-full"

  const image = event.image ? (
    <Image
      src={event.image}
      alt={event.title}
      width={EVENT_IMAGE_WIDTH}
      height={EVENT_IMAGE_HEIGHT}
      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 55vw, 640px"
      priority={prioritizeImage}
      loading={prioritizeImage ? "eager" : "lazy"}
      fetchPriority={prioritizeImage ? "high" : undefined}
      unoptimized={event.image.startsWith("http")}
      onLoad={() => setImageReady(true)}
      className={cn(
        "w-full h-full object-cover object-center",
        "motion-safe:transition-opacity motion-safe:duration-300",
        "motion-reduce:transition-none",
        imageReady ? "opacity-100" : "opacity-0"
      )}
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-card via-muted/50 to-card" />
  )

  const tagPill = (
    <h4 suppressHydrationWarning className={tag.textClass}>
      {tag.kind === "today" ? (
        tag.label
      ) : (
        <GoldShineText as="span" scrollTargetRef={shineSectionRef}>
          {tag.label}
        </GoldShineText>
      )}
    </h4>
  )

  const body = (
    <>
      <EventDetailLink slug={event.slug} className="flex flex-col flex-1">
        {/* Desktop heights deliberately compact — owner feedback 2026-07-02: event images were too big on desktop. */}
        <div className="h-[220px] sm:h-[280px] md:h-[260px] lg:h-[280px] overflow-hidden relative bg-muted shrink-0">
          <div
            className={cn(
              "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
              "motion-safe:transition-opacity motion-safe:duration-300",
              "motion-reduce:transition-none",
              event.image ? (imageReady ? "opacity-0" : "opacity-100") : "opacity-0"
            )}
            aria-hidden
          />
          {staticInner ? (
            <div className="relative z-[1] w-full h-full">{image}</div>
          ) : (
            <m.div
              className="relative z-[1] w-full h-full"
              animate={{ scale: enableTilt && isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {image}
            </m.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none" />
          {staticInner ? (
            <span
              suppressHydrationWarning
              className={`absolute top-5 left-5 sm:top-6 sm:left-6 z-[2] ${tag.pillClass}`}
            >
              {tagPill}
            </span>
          ) : (
            <m.span
              suppressHydrationWarning
              className={`absolute top-5 left-5 sm:top-6 sm:left-6 z-[2] ${tag.pillClass}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.12 + 0.2 }}
            >
              {tagPill}
            </m.span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              {staticInner ? (
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-accent transition-colors leading-tight">
                  {event.title}
                </h3>
              ) : (
                <m.h3
                  className="text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-accent transition-colors leading-tight"
                  whileHover={{ x: 4 }}
                >
                  {event.title}
                </m.h3>
              )}
              {event.subtitle ? (
                <p className="text-muted-foreground text-base sm:text-lg mt-1">{event.subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:gap-6 mt-auto">
            <div className="flex items-center gap-3 text-base sm:text-lg text-muted-foreground">
              <Calendar size={18} className="text-accent shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-base sm:text-lg text-muted-foreground">
              <Clock size={18} className="text-accent shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-base sm:text-lg text-muted-foreground col-span-2">
              <MapPin size={18} className="text-accent shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </EventDetailLink>

      {staticInner ? null : (
        <m.div
          className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl bg-accent/5"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.22 }}
        />
      )}
    </>
  )

  if (enableTilt) {
    return (
      <EventCardTiltShell
        onHover={onHover}
        onLeave={onLeave}
        className={className}
        initial={initial}
        animate={animate}
        transition={transition}
      >
        {body}
      </EventCardTiltShell>
    )
  }

  return (
    <m.article
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ rotateX: 0, rotateY: 0 }}
    >
      {body}
    </m.article>
  )
}

const CAROUSEL_OPTS = {
  align: "start" as const,
  containScroll: "trimSnaps" as const,
  dragFree: false,
}

function EventsCarousel({
  events,
  isRevealed,
  enableTilt,
  staticInner,
  hoveredId,
  onHover,
  onLeave,
  now,
  shineSectionRef,
  prefetchDetails,
  prioritizeFirstImage,
}: {
  events: EventItem[]
  isRevealed: boolean
  enableTilt: boolean
  staticInner: boolean
  hoveredId: number | null
  onHover: (id: number) => void
  onLeave: () => void
  now: Date
  shineSectionRef: RefObject<HTMLElement | null>
  prefetchDetails: boolean
  prioritizeFirstImage: boolean
}) {
  const router = useRouter()
  const eventSlugs = events.map((event) => event.slug).join("|")

  useEffect(() => {
    if (!prefetchDetails) return
    const hrefs = eventSlugs.split("|").filter(Boolean).map(eventDetailPath)
    if (hrefs.length === 0) return

    let cancelled = false
    const prefetchRoutes = () => {
      if (cancelled) return
      hrefs.forEach((href) => router.prefetch(href))
    }

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 1500 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }

    const timeoutId = globalThis.setTimeout(prefetchRoutes, 250)
    return () => {
      cancelled = true
      globalThis.clearTimeout(timeoutId)
    }
  }, [eventSlugs, prefetchDetails, router])

  if (events.length === 0) return null
  return (
    <div className="w-full">
      <Carousel opts={CAROUSEL_OPTS} className="w-full">
        <CarouselContent
          className="-ml-4 md:-ml-6 lg:-ml-8"
          viewportClassName="py-6 md:py-8"
        >
          {events.map((event, i) => (
            /* No h-full on items: a specified % height on a flex child of an auto-height
               row disables align-items:stretch, so cards stop matching heights. */
            <CarouselItem
              key={event.id}
              className="pl-4 md:pl-6 lg:pl-8 basis-[min(380px,92vw)] sm:basis-[min(520px,85vw)] md:basis-[min(460px,48vw)] lg:basis-[min(480px,33%)] flex"
            >
              <EventCard
                event={event}
                index={i}
                prioritizeImage={prioritizeFirstImage && i === 0}
                isRevealed={isRevealed}
                enableTilt={enableTilt}
                staticInner={staticInner}
                isHovered={hoveredId === event.id}
                onHover={() => onHover(event.id)}
                onLeave={onLeave}
                now={now}
                shineSectionRef={shineSectionRef}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </div>
  )
}

const reels = getReels()

/** Instagram recap videos ("Reels") — link cards, so the page never embeds third-party players. */
function ReelsBlock({
  isRevealed,
  shineSectionRef,
}: {
  isRevealed: boolean
  shineSectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="pt-4 pb-0"
    >
      <GoldShineText
        as="h3"
        scrollTargetRef={shineSectionRef}
        className="lupfr-heading-sub mb-4 md:mb-5"
      >
        Reels
      </GoldShineText>
      <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-6">
        Event recaps, straight from our Instagram — watch the night back.
      </p>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {reels.map((reel) => (
          <a
            key={reel.url}
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/reel inline-flex max-w-full min-w-0 items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/50"
          >
            <Instagram size={20} className="text-accent shrink-0" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground transition-colors group-hover/reel:text-accent">
                {reel.label}
              </span>
              <span className="block text-sm text-muted-foreground">Watch on Instagram</span>
            </span>
          </a>
        ))}
        <a
          href={LINKS.instagramReels}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-center rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground/90 transition-colors hover:border-accent hover:text-accent"
        >
          <ExternalLink size={16} className="shrink-0" aria-hidden />
          View all reels
        </a>
      </div>
    </m.div>
  )
}

function useFinePointerHover(): boolean {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const apply = () => setFine(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
  return fine
}

export function Events() {
  const ref = useRef(null)
  // once:false + hasRevealed latch: section can leave view without fading cards back out.
  // margin preloads Past/Reels slightly before the section is fully on screen.
  const inViewNow = useInView(ref, { once: false, margin: "0px 0px 80px 0px", amount: 0.12 })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (!inViewNow) return
    const timeoutId = window.setTimeout(() => setHasRevealed(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [inViewNow])
  const isRevealed = hasRevealed
  // Mount Past + Reels only after the section has been (or is about to be) in view.
  const mountBelowFold = hasRevealed
  const enableTilt = useFinePointerHover()
  const isMobile = useIsMobile()
  // Touch/unresolved: skip hover-only motion nodes; desktop keeps full card inners.
  const staticInner = isMobile !== false
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const clearHover = useCallback(() => setHoveredId(null), [])
  const now = useEventCalendarClock()
  const upcoming = getUpcomingEvents(now)
  const past = getPastEvents(now)

  return (
    <section
      id="events"
      ref={ref}
      className="pt-10 sm:pt-12 md:pt-14 lg:pt-16 pb-10 sm:pb-12 md:pb-14 lg:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-visible"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <ScrollReveal variant="up" freezeAfterReveal className="container mx-auto relative z-10 max-w-7xl">
        <m.div
          initial={{ opacity: 0, y: 36 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 sm:mb-8 md:mb-10"
        >
          <h2>
            <GoldShineText scrollTargetRef={ref}>Events</GoldShineText>
          </h2>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-18 lg:mb-20"
        >
          <GoldShineText
            as="h3"
            scrollTargetRef={ref}
            className="lupfr-heading-sub mb-8 md:mb-10"
          >
            Upcoming
          </GoldShineText>
          {upcoming.length > 0 ? (
            <EventsCarousel
              events={upcoming}
              isRevealed={isRevealed}
              enableTilt={enableTilt}
              staticInner={staticInner}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={clearHover}
              now={now}
              shineSectionRef={ref}
              prefetchDetails={isMobile === false}
              prioritizeFirstImage={isMobile === false}
            />
          ) : (
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              More dates coming soon — join the list below to hear first.
            </p>
          )}
        </m.div>

        {mountBelowFold && past.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="pt-2 pb-4"
          >
            <GoldShineText
              as="h3"
              scrollTargetRef={ref}
              className="lupfr-heading-sub mb-8 md:mb-10"
            >
              Past
            </GoldShineText>
            <EventsCarousel
              events={past}
              isRevealed={isRevealed}
              enableTilt={enableTilt}
              staticInner={staticInner}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={clearHover}
              now={now}
              shineSectionRef={ref}
              prefetchDetails={isMobile === false}
              prioritizeFirstImage={isMobile === false}
            />
          </m.div>
        )}

        {mountBelowFold ? <ReelsBlock isRevealed={isRevealed} shineSectionRef={ref} /> : null}
      </ScrollReveal>
    </section>
  )
}
