"use client"

import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { Calendar, MapPin, Clock, Ticket, ArrowRight } from "lucide-react"
import { LINKS } from "@/lib/links"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"

const events = [
  {
    id: 1,
    title: "Boiler Boat",
    subtitle: "Bay Cruiser Edition",
    date: "April 12, 2025",
    time: "6:00 PM - 11:00 PM",
    location: "SF Marina, Pier 40",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    tag: "Past Event",
    tagColor: "bg-muted",
  },
  {
    id: 2,
    title: "Rooftop Grooves",
    subtitle: "Sunset Sessions",
    date: "April 26, 2025",
    time: "4:00 PM - 10:00 PM",
    location: "The View Lounge, SOMA",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    tag: "Past Event",
    tagColor: "bg-muted",
  },
  {
    id: 3,
    title: "Warehouse Sessions",
    subtitle: "Underground Series",
    date: "May 10, 2025",
    time: "10:00 PM - 4:00 AM",
    location: "Secret Location",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    tag: "Past Event",
    tagColor: "bg-muted",
  },
  {
    id: 4,
    title: "Shamrock & House",
    subtitle: "St. Patrick's Special",
    date: "March 17, 2025",
    time: "2:00 PM - 10:00 PM",
    location: "Public Works, Mission",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    tag: "Past Event",
    tagColor: "bg-muted",
  },
]

type EventItem = (typeof events)[number]

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
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })

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
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-accent/50 transition-[border-color] duration-200"
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <motion.img
          src={event.image}
          alt={event.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        <motion.span
          className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${event.tagColor} text-foreground`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: index * 0.12 + 0.2 }}
        >
          {event.tag}
        </motion.span>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <motion.h3
              className="text-2xl font-bold tracking-tight group-hover:text-accent transition-colors"
              whileHover={{ x: 4 }}
            >
              {event.title}
            </motion.h3>
            <p className="text-muted-foreground">{event.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={14} className="text-accent" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={14} className="text-accent" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
            <MapPin size={14} className="text-accent" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl bg-accent/5"
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.article>
  )
}

export function Events() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section id="events" ref={ref} className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <ScrollReveal variant="up" className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <p className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4">Gallery</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
            <GoldShineText scrollTargetRef={ref}>Past</GoldShineText>
            <br />
            <GoldShineText scrollTargetRef={ref}>Events</GoldShineText>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {events.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              index={i}
              isInView={isInView}
              isHovered={hoveredId === event.id}
              onHover={() => setHoveredId(event.id)}
              onLeave={() => setHoveredId(null)}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
