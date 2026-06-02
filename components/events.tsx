"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState, useEffect, useCallback, type RefObject } from "react"
import { Calendar, MapPin, Clock } from "lucide-react"
import { eventDetailPath, getUpcomingEvents, getPastEvents, getEventTag, type EventItem } from "@/lib/events"
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

function EventCard({
  event,
  index,
  prioritizeImage,
  isRevealed,
  enableTilt,
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
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  now: Date
  shineSectionRef: RefObject<HTMLElement | null>
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [imageReady, setImageReady] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 420, damping: 32 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 420, damping: 32 })
  const tag = getEventTag(event, now)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enableTilt || !cardRef.current) return
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

  const isFirstCard = index === 0
  return (
    <motion.article
      ref={cardRef}
      initial={isFirstCard ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: isFirstCard ? 1 : 0, y: isFirstCard ? 0 : 40 }}
      transition={{ duration: 0.45, delay: isFirstCard ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-accent/50 transition-[border-color] duration-150 ease-out shadow-xl"
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        enableTilt
          ? { rotateX, rotateY, transformPerspective: 800 }
          : { rotateX: 0, rotateY: 0 }
      }
    >
      <EventDetailLink slug={event.slug}>
        <div className="aspect-[16/10] overflow-hidden relative bg-muted">
          <div
            className={cn(
              "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
              "motion-safe:transition-opacity motion-safe:duration-300",
              "motion-reduce:transition-none",
              imageReady ? "opacity-0" : "opacity-100"
            )}
            aria-hidden
          />
          <motion.div
            className="relative z-[1] w-full h-full"
            animate={{ scale: enableTilt && isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
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
                "w-full h-full object-cover object-top",
                "motion-safe:transition-opacity motion-safe:duration-300",
                "motion-reduce:transition-none",
                imageReady ? "opacity-100" : "opacity-0"
              )}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none" />
          <motion.span
            suppressHydrationWarning
            className={`absolute top-5 left-5 sm:top-6 sm:left-6 ${tag.pillClass}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.12 + 0.2 }}
          >
            <h4 suppressHydrationWarning className={tag.textClass}>
              {tag.kind === "today" ? (
                tag.label
              ) : (
                <GoldShineText as="span" scrollTargetRef={shineSectionRef}>
                  {tag.label}
                </GoldShineText>
              )}
            </h4>
          </motion.span>
        </div>

        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <motion.h3
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold tracking-tight group-hover:text-accent transition-colors leading-tight"
                whileHover={{ x: 4 }}
              >
                {event.title}
              </motion.h3>
              {event.subtitle ? (
                <p className="text-muted-foreground text-base sm:text-lg mt-1">{event.subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:gap-6">
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

      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl bg-accent/5"
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.22 }}
      />
    </motion.article>
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
            <CarouselItem
              key={event.id}
              className="pl-4 md:pl-6 lg:pl-8 basis-[min(380px,92vw)] sm:basis-[min(520px,85vw)] md:basis-[min(580px,55vw)] lg:basis-[min(640px,48%)]"
            >
              <EventCard
                event={event}
                index={i}
                prioritizeImage={prioritizeFirstImage && i === 0}
                isRevealed={isRevealed}
                enableTilt={enableTilt}
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
  const inViewNow = useInView(ref, { once: false, margin: "0px 0px 80px 0px", amount: 0.12 })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (!inViewNow) return
    const timeoutId = window.setTimeout(() => setHasRevealed(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [inViewNow])
  const isRevealed = hasRevealed
  const enableTilt = useFinePointerHover()
  const isMobile = useIsMobile()
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const clearHover = useCallback(() => setHoveredId(null), [])
  const now = useEventCalendarClock()
  const upcoming = getUpcomingEvents(now)
  const past = getPastEvents(now)

  return (
    <section
      id="events"
      ref={ref}
      className="pt-10 sm:pt-12 md:pt-14 lg:pt-16 pb-20 sm:pb-24 md:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-visible"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <ScrollReveal variant="up" freezeAfterReveal className="container mx-auto relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 sm:mb-8 md:mb-10"
        >
          <h2>
            <GoldShineText scrollTargetRef={ref}>Events</GoldShineText>
          </h2>
        </motion.div>

        <motion.div
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
        </motion.div>

        {past.length > 0 && (
          <motion.div
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
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={clearHover}
              now={now}
              shineSectionRef={ref}
              prefetchDetails={isMobile === false}
              prioritizeFirstImage={isMobile === false}
            />
          </motion.div>
        )}
      </ScrollReveal>
    </section>
  )
}
