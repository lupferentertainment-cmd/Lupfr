"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { m, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react"
import { eventDetailPath, getUpcomingEvents, getEventTag, type EventItem } from "@/lib/events"
import { getBrands } from "@/lib/data/brands"
import { useEventCalendarClock } from "@/hooks/use-event-calendar-clock"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { EventDetailLink } from "@/components/event-detail-link"
import { PartifulBand } from "@/components/partiful-band"
import { ArrowLeft, ArrowRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const brandAccentByTitle = new Map(getBrands().map((brand) => [brand.title, brand.accent]))

const EVENT_IMAGE_WIDTH = 1200
const EVENT_IMAGE_HEIGHT = 800
const SHORT_EVENT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

function eventShortDate(event: EventItem): string {
  return event.dateISO
    ? SHORT_EVENT_DATE.format(new Date(`${event.dateISO}T00:00:00Z`))
    : "TBD"
}

/** Tilt springs live here so EventCard never creates them on touch/mobile. */
function EventCardTiltShell({
  children,
  onHover,
  onLeave,
  className,
  initial,
  animate,
  transition,
  style,
}: {
  children: ReactNode
  onHover: () => void
  onLeave: () => void
  className: string
  initial: { opacity: number; y: number }
  animate: { opacity: number; y: number }
  transition: { duration: number; delay: number; ease: number[] }
  style?: CSSProperties
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
      style={{ rotateX, rotateY, transformPerspective: 800, ...style }}
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
  compact = false,
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
  /** Past archive: smaller footprint (owner request 2026-07-21). */
  compact?: boolean
}) {
  const [imageReady, setImageReady] = useState(false)
  const tag = getEventTag(event, now)
  const brandAccent = event.brandTag ? brandAccentByTitle.get(event.brandTag) : undefined

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
  // Owner 2026-08-08: cards carry no per-brand border colour — the design file
  // frames every event in the neutral `var(--border)` hairline and lets the
  // brand read through the tag text alone.
  const className = cn(
    "event-card-depth group relative w-full overflow-hidden rounded-sm bg-card border flex flex-col h-full",
    "border-border hover:border-accent/50"
  )

  const image = event.image ? (
    <Image
      src={event.image}
      alt={event.title}
      width={EVENT_IMAGE_WIDTH}
      height={EVENT_IMAGE_HEIGHT}
      sizes="(max-width: 640px) 84vw, 300px"
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
  ) : (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--muted) 0, var(--muted) 10px, var(--card) 10px, var(--card) 20px)",
      }}
    >
      <span className="font-mono text-xs uppercase tracking-[0.08em] text-foreground/40">
        Coming soon
      </span>
    </div>
  )

  const tagPill = (
    <h4 className="m-0 font-mono text-[10px] font-normal uppercase tracking-[0.08em] text-[#f3efe6]">
      {tag.label}
    </h4>
  )

  const body = (
    <>
      <EventDetailLink slug={event.slug} className="flex flex-col flex-1">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted shrink-0",
            compact ? "aspect-[5/4]" : "aspect-square"
          )}
        >
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
          {/* Poster-agnostic frame (owner 2026-07-27): borderless posters get a
             code-drawn dual-tone inset frame so they read framed; posters that
             bake their own border opt out via `bakedFrame` so they never show a
             double border. Corner brackets stay on every card. */}
          {event.image && !event.bakedFrame ? (
            <div
              className="event-card-frame pointer-events-none absolute inset-[10px] z-[2]"
              aria-hidden
            />
          ) : null}
          <div
            className="absolute bottom-[10px] left-[10px] z-[2] h-3 w-3 border-b border-l border-foreground/50 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute bottom-[10px] right-[10px] z-[2] h-3 w-3 border-b border-r border-foreground/50 pointer-events-none"
            aria-hidden
          />
          {staticInner ? (
            <span
              suppressHydrationWarning
              className="absolute left-[14px] top-[14px] z-[2] rounded-full border border-white/15 bg-[#0b0a08]/75 px-[10px] py-[6px] backdrop-blur-sm"
            >
              {tagPill}
            </span>
          ) : (
            <m.span
              suppressHydrationWarning
              className="absolute left-[14px] top-[14px] z-[2] rounded-full border border-white/15 bg-[#0b0a08]/75 px-[10px] py-[6px] backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.12 + 0.2 }}
            >
              {tagPill}
            </m.span>
          )}
          <span className="text-gold-accent absolute right-[14px] top-[14px] z-[2] rounded-full border border-white/15 bg-[#0b0a08]/75 px-[10px] py-[6px] font-mono text-[10px] uppercase tracking-[0.08em] backdrop-blur-sm">
            {event.city ?? "SF"}
          </span>
        </div>

        <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-[22px]")}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border font-mono uppercase tracking-wider",
                compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-[9px]",
                "border-border",
                brandAccent ? undefined : "text-foreground"
              )}
              style={brandAccent ? { color: brandAccent } : undefined}
            >
              <span
                className="h-[7px] w-[7px] shrink-0 rounded-full"
                style={{ backgroundColor: brandAccent ?? "currentColor" }}
                aria-hidden
              />
              <BrandSlashText text={event.brandTag ?? "IN//SIDE"} color={brandAccent} />
            </span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              {eventShortDate(event)}
            </span>
          </div>
          {staticInner ? (
            <h3
              className={cn(
                "mb-[10px] font-condensed font-extrabold uppercase leading-none text-foreground transition-colors group-hover:text-accent",
                compact ? "text-[20px]" : "text-[26px]"
              )}
            >
              <BrandSlashText text={event.title} />
            </h3>
          ) : (
            <m.h3
              className={cn(
                "mb-[10px] font-condensed font-extrabold uppercase leading-none text-foreground transition-colors group-hover:text-accent",
                compact ? "text-[20px]" : "text-[26px]"
              )}
              whileHover={{ x: 4 }}
            >
              <BrandSlashText text={event.title} />
            </m.h3>
          )}
          {event.subtitle ? (
            <p
              className={cn(
                "text-gold-accent mb-[14px] leading-snug",
                compact ? "text-[12px] line-clamp-2" : "text-[13px]"
              )}
            >
              {event.subtitle}
            </p>
          ) : null}
          <span className="text-gold-accent mt-auto text-[13px] transition-colors group-hover:text-foreground">
            View details →
          </span>
        </div>
      </EventDetailLink>

      {staticInner ? null : (
        <m.div
          className="absolute inset-0 pointer-events-none rounded-sm sm:rounded-md bg-accent/5"
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
  // Free momentum drag: the hard snap rebound fought the compact 300px cards.
  dragFree: true,
  // Arrows page by the visible group, not one card at a time.
  slidesToScroll: "auto" as const,
}

const CAROUSEL_ARROW_CLASS =
  "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow backdrop-blur transition-all duration-200 hover:border-accent/50 hover:bg-accent/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-0"

function EventsCarousel({
  events,
  isRevealed,
  enableTilt,
  staticInner,
  hoveredId,
  onHover,
  onLeave,
  now,
  prefetchDetails,
  prioritizeFirstImage,
  compact = false,
  bleedRight = false,
}: {
  events: EventItem[]
  isRevealed: boolean
  enableTilt: boolean
  staticInner: boolean
  hoveredId: number | null
  onHover: (id: number) => void
  onLeave: () => void
  now: Date
  prefetchDetails: boolean
  prioritizeFirstImage: boolean
  compact?: boolean
  /** Spill cards to the true viewport right edge (arrows stay anchored). */
  bleedRight?: boolean
}) {
  const router = useRouter()
  const eventSlugs = events.map((event) => event.slug).join("|")
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    if (!api) return
    const update = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }
    update()
    api.on("reInit", update)
    api.on("select", update)
    api.on("scroll", update)
    return () => {
      api.off("reInit", update)
      api.off("select", update)
      api.off("scroll", update)
    }
  }, [api])

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
    <div className="w-full" data-compact={compact ? "true" : undefined}>
      <Carousel opts={CAROUSEL_OPTS} setApi={setApi} className="w-full">
        <CarouselContent
          className="-ml-4 md:-ml-6"
          viewportClassName={cn(
            "pb-3",
            // -mr(50vw-50%) widens the auto-width viewport so its right edge lands
            // on the viewport edge; overflow-hidden clips inner cards, no page scroll.
            bleedRight && "events-bleed-right mr-[calc(50%-50vw)]"
          )}
        >
          {events.map((event, i) => (
            /* No h-full on items: a specified % height on a flex child of an auto-height
               row disables align-items:stretch, so cards stop matching heights. */
            <CarouselItem
              key={event.id}
              className={cn(
                "pl-4 md:pl-6 flex",
                compact
                  ? "basis-[min(180px,70vw)] md:basis-[196px]"
                  : "basis-[min(316px,89vw)] md:basis-[324px]"
              )}
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
                compact={compact}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {canScrollPrev || canScrollNext ? (
          <>
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Scroll to previous events"
              className={cn(CAROUSEL_ARROW_CLASS, "left-2 lg:-left-5")}
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Scroll to next events"
              className={cn(CAROUSEL_ARROW_CLASS, "right-2 lg:-right-5")}
            >
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
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
  // once:false + hasRevealed latch: section can leave view without fading cards back out.
  // Margin preloads Past slightly before the section is fully on screen.
  const inViewNow = useInView(ref, { once: false, margin: "0px 0px 80px 0px", amount: 0.12 })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (!inViewNow) return
    const timeoutId = window.setTimeout(() => setHasRevealed(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [inViewNow])
  const isRevealed = hasRevealed
  // Mount Past only after the section has been (or is about to be) in view.
  const enableTilt = useFinePointerHover()
  const isMobile = useIsMobile()
  // Touch/unresolved: skip hover-only motion nodes; desktop keeps full card inners.
  const staticInner = isMobile !== false
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const clearHover = useCallback(() => setHoveredId(null), [])
  const now = useEventCalendarClock()
  const upcoming = getUpcomingEvents(now)

  return (
    <section
      id="events"
      ref={ref}
      className="lupfr-section-pad relative overflow-visible border-b border-border px-4 sm:px-6 lg:px-12"
    >
      <ScrollReveal variant="up" freezeAfterReveal className="container mx-auto relative z-10 max-w-[1400px]">
        <m.div
          initial={{ opacity: 0, y: 36 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4 md:mb-14"
        >
          <div>
            <p className="lupfr-section-kicker mb-[14px]">Upcoming</p>
            <h2 className="text-foreground">Events</h2>
          </div>
          <Link
            href="/events"
            prefetch
            className="text-gold-accent border-b border-[var(--gold)] pb-0.5 text-sm transition-colors hover:text-foreground"
          >
            View all events →
          </Link>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-18 lg:mb-20"
        >
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
              prefetchDetails={isMobile === false}
              prioritizeFirstImage={isMobile === false}
              bleedRight
            />
          ) : (
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              More dates coming soon — join the list below to hear first.
            </p>
          )}
        </m.div>

        {/* Owner restructure note, 2026-08-28: Partiful band under the events
           grid — all ticketing runs through Partiful now. */}
        <PartifulBand />

        {/* The Past archive lives on /events only (owner request 2026-08-05) —
            the landing page stays forward-looking. `EventsDirectory` renders it
            behind the Past/All filter there. */}
      </ScrollReveal>
    </section>
  )
}
