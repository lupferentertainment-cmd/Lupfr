"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Music, Users, Mic2, PartyPopper, Building2, Sparkles } from "lucide-react"

const services = [
  {
    icon: PartyPopper,
    title: "Owned Events",
    description: "Our signature branded experiences—from Boiler Boat to Rooftop Grooves. We handle everything: venue, talent, production, and promotion.",
    features: ["Full Production", "Curated Lineups", "Premium Venues", "Marketing & Promotion"],
  },
  {
    icon: Mic2,
    title: "Talent Booking",
    description: "Connect with the right artists through our extensive network. We source, negotiate, and coordinate talent for your events.",
    features: ["Artist Discovery", "Contract Negotiation", "Schedule Coordination", "On-Site Management"],
  },
  {
    icon: Building2,
    title: "Venue Programming",
    description: "We curate regular music programming for venues looking to elevate their nightlife presence with consistent, quality entertainment.",
    features: ["Monthly DJ Nights", "Music Curation", "Event Management", "Audience Development"],
  },
  {
    icon: Users,
    title: "Private Events",
    description: "From corporate gatherings to luxury celebrations, we bring the same energy and attention to detail to every private event.",
    features: ["Custom Concepts", "Full Service", "Premium Sound", "Exclusive Access"],
  },
  {
    icon: Music,
    title: "Event Production",
    description: "End-to-end production services for venues and brands. We bring the vision, crew, and execution to make it happen.",
    features: ["Sound & Lighting", "Staging & Decor", "Vendor Management", "Day-Of Coordination"],
  },
  {
    icon: Sparkles,
    title: "Brand Partnerships",
    description: "Collaborate with us on activations that reach the SF nightlife community through our events and platform.",
    features: ["Event Sponsorships", "Brand Activations", "Content Creation", "Influencer Access"],
  },
]

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section id="services" ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-[150px]" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-accent uppercase tracking-[0.3em] text-sm mb-4">What We Do</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            From intimate bar takeovers to large-scale productions, we bring house music culture to life across San Francisco.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-500 h-full">
                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent transition-colors duration-300"
                  animate={{
                    rotate: activeIndex === i ? 360 : 0,
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <service.icon 
                    size={28} 
                    className="text-foreground group-hover:text-accent-foreground transition-colors" 
                  />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold tracking-tight mb-3 group-hover:text-accent transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li 
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover Line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-b-2xl"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeIndex === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "50+", label: "Events Hosted" },
            { value: "100+", label: "Artists Booked" },
            { value: "10K+", label: "Happy Attendees" },
            { value: "15+", label: "Venue Partners" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
