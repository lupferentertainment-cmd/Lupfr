"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Calendar, MapPin, Clock } from "lucide-react"
import { getUpcomingEvents, getPastEvents, getEventTag, type EventItem } from "@/lib/events"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import type { CarouselApi } from "@/components/ui/carousel"

const EVENT_IMAGE_WIDTH = 1200
const EVENT_IMAGE_HEIGHT = 800

function EventCard({
  event,
  index,
  isInView,
  isHovered,
  onHover,
  onLeave,
}: {
  event: EventItem
  index: number
  isInView: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const cardRef = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 420, damping: 32 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 420, damping: 32 })
  const tag = getEventTag(event)

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

  const isFirstCard = index === 0
  return (
    <motion.article
      ref={cardRef}
      initial={isFirstCard ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: isFirstCard ? 0 : index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-accent/50 transition-[border-color,transform] duration-150 ease-out shadow-xl"
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
    >
      <Link href={`/events/${event.slug}`} className="block">
        <div className="aspect-[16/10] overflow-hidden relative">
          <motion.div
            className="relative w-full h-full"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={event.image}
              alt={event.title}
              width={EVENT_IMAGE_WIDTH}
              height={EVENT_IMAGE_HEIGHT}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 55vw, 640px"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : undefined}
              unoptimized={event.image.startsWith("http")}
              className="w-full h-full object-cover object-top"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <motion.span
            className={`absolute top-5 left-5 sm:top-6 sm:left-6 px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-full ${tag.color} text-foreground`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.12 + 0.2 }}
          >
            {tag.label}
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
      </Link>

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
  isInView,
  hoveredId,
  onHover,
  onLeave,
}: {
  events: EventItem[]
  isInView: boolean
  hoveredId: number | null
  onHover: (id: number) => void
  onLeave: () => void
}) {
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [snapCount, setSnapCount] = useState(0)

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

  if (events.length === 0) return null
  return (
    <div className="w-full">
      <Carousel opts={CAROUSEL_OPTS} className="w-full" setApi={setApi}>
        <CarouselContent className="-ml-4 md:-ml-6 lg:-ml-8">
          {events.map((event, i) => (
            <CarouselItem
              key={event.id}
              className="pl-4 md:pl-6 lg:pl-8 basis-[min(380px,92vw)] sm:basis-[min(520px,85vw)] md:basis-[min(580px,55vw)] lg:basis-[min(640px,48%)]"
            >
              <EventCard
                event={event}
                index={i}
                isInView={isInView}
                isHovered={hoveredId === event.id}
                onHover={() => onHover(event.id)}
                onLeave={onLeave}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {snapCount > 1 && (
        <div className="flex justify-center gap-2.5 mt-8 md:mt-10" aria-hidden>
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-6 bg-foreground/80"
                  : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to events slide ${i + 1} of ${snapCount}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Events() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const upcoming = getUpcomingEvents()
  const past = getPastEvents()

  return (
    <section id="events" ref={ref} className="py-24 sm:py-28 md:py-36 lg:py-44 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <ScrollReveal variant="up" className="container mx-auto relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 sm:mb-20 md:mb-24"
        >
          <p className="text-gold-accent uppercase tracking-[0.3em] text-sm sm:text-base mb-4">Gallery</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
            <GoldShineText scrollTargetRef={ref}>Events</GoldShineText>
          </h2>
        </motion.div>

        {upcoming.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 md:mb-28 lg:mb-32"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 md:mb-10">
              <GoldShineText scrollTargetRef={ref} className="font-bold">
                Upcoming events
              </GoldShineText>
            </h3>
            <EventsCarousel
              events={upcoming}
              isInView={isInView}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
            />
          </motion.div>
        )}

        {past.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="pt-4"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 md:mb-10">
              <GoldShineText scrollTargetRef={ref} className="font-bold">
                Past events
              </GoldShineText>
            </h3>
            <EventsCarousel
              events={past}
              isInView={isInView}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onLeave={() => setHoveredId(null)}
            />
          </motion.div>
        )}
      </ScrollReveal>
    </section>
  )
}
