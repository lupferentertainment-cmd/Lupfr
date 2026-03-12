"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ArrowRight, Calendar, MapPin, Clock, Ticket } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Boiler Boat",
    subtitle: "Bay Cruiser Edition",
    date: "April 12, 2026",
    time: "6:00 PM - 11:00 PM",
    location: "SF Marina, Pier 40",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    tag: "Sold Out",
    tagColor: "bg-destructive",
  },
  {
    id: 2,
    title: "Rooftop Grooves",
    subtitle: "Sunset Sessions",
    date: "April 26, 2026",
    time: "4:00 PM - 10:00 PM",
    location: "The View Lounge, SOMA",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    tag: "Limited Tickets",
    tagColor: "bg-accent",
  },
  {
    id: 3,
    title: "Warehouse Sessions",
    subtitle: "Underground Series",
    date: "May 10, 2026",
    time: "10:00 PM - 4:00 AM",
    location: "Secret Location",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&q=80",
    tag: "On Sale",
    tagColor: "bg-green-500",
  },
  {
    id: 4,
    title: "Shamrock & House",
    subtitle: "St. Patrick's Special",
    date: "March 17, 2027",
    time: "2:00 PM - 10:00 PM",
    location: "Public Works, Mission",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    tag: "Coming Soon",
    tagColor: "bg-muted",
  },
]

export function Events() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section id="events" ref={ref} className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="text-accent uppercase tracking-[0.3em] text-sm mb-4">What&apos;s Next</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              Upcoming<br />
              <span className="text-muted-foreground">Events</span>
            </h2>
            <motion.a
              href="#"
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto"
              whileHover={{ x: 5 }}
            >
              <span className="uppercase tracking-wider text-sm">View All Events</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, i) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-500"
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <motion.img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  animate={{
                    scale: hoveredId === event.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${event.tagColor} ${event.tagColor === "bg-accent" || event.tagColor === "bg-green-500" ? "text-background" : "text-foreground"}`}>
                  {event.tag}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground">{event.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
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

                <motion.button
                  className="w-full flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-accent text-foreground hover:text-accent-foreground font-semibold uppercase tracking-wider text-sm rounded-full transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Ticket size={16} />
                  Get Tickets
                </motion.button>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  background: hoveredId === event.id 
                    ? "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(200, 150, 100, 0.06), transparent 40%)"
                    : "none"
                }}
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
