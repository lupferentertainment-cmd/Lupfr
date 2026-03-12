"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Instagram, Music, ExternalLink } from "lucide-react"

const artists = [
  {
    name: "DJ Helix",
    genre: "Deep House",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80",
    instagram: "#",
  },
  {
    name: "Luna Waves",
    genre: "Tech House",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
    instagram: "#",
  },
  {
    name: "Sonic Drift",
    genre: "Progressive House",
    image: "https://images.unsplash.com/photo-1571935441283-d64ecfb20ec7?w=400&q=80",
    instagram: "#",
  },
  {
    name: "Maya Chen",
    genre: "Afro House",
    image: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=400&q=80",
    instagram: "#",
  },
  {
    name: "Bassline Kid",
    genre: "House / Garage",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
    instagram: "#",
  },
  {
    name: "Frequency",
    genre: "Melodic Techno",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    instagram: "#",
  },
]

export function Artists() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="artists" ref={ref} className="py-32 px-6 relative overflow-hidden bg-card/50">
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="text-accent uppercase tracking-[0.3em] text-sm mb-4">The Sound</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              Featured<br />
              <span className="text-muted-foreground">Artists</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              We work with talented DJs and producers who share our vision for creating unforgettable house music experiences.
            </p>
          </div>
        </motion.div>

        {/* Artists Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {artists.map((artist, i) => (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <motion.img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Music size={14} className="text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {artist.genre}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight group-hover:text-accent transition-colors">
                    {artist.name}
                  </h3>
                </motion.div>

                {/* Social Links - Show on Hover */}
                <motion.div
                  className="flex items-center gap-3 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  <a 
                    href={artist.instagram}
                    className="p-2 bg-secondary/80 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Instagram size={16} />
                  </a>
                  <a 
                    href="#"
                    className="p-2 bg-secondary/80 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </motion.div>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-accent/50 group-hover:border-accent transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Are you a DJ or producer? We&apos;re always looking for fresh talent.
          </p>
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold uppercase tracking-wider rounded-full hover:border-accent hover:text-accent transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit Your Mix
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
