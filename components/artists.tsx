"use client"

import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { Instagram, Music, ExternalLink } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"

const artists = [
  { id: 1, name: "DJ Helix", genre: "Deep House", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80", instagram: "#" },
  { id: 2, name: "Luna Waves", genre: "Tech House", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", instagram: "#" },
  { id: 3, name: "Sonic Drift", genre: "Progressive House", image: "/sonic-drift.jpg", instagram: "#" },
  { id: 4, name: "Maya Chen", genre: "Afro House", image: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=800&q=80", instagram: "#" },
  { id: 5, name: "Bassline Kid", genre: "House / Garage", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80", instagram: "#" },
  { id: 6, name: "Frequency", genre: "Melodic Techno", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", instagram: "#" },
]

type ArtistItem = (typeof artists)[number]

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236b7280'/%3E%3Cstop offset='100%25' style='stop-color:%234b5563'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='48'%3EDJ%3C/text%3E%3C/svg%3E"

function ArtistCard({
  artist,
  index,
  isInView,
  isHovered,
  onHover,
  onLeave,
}: {
  artist: ArtistItem
  index: number
  isInView: boolean
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [imageError, setImageError] = useState(false)
  const imageSrc = imageError ? FALLBACK_IMAGE : artist.image
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
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      <div className="aspect-square overflow-hidden relative">
        <motion.img
          src={imageSrc}
          alt={`${artist.name}, ${artist.genre}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        <motion.span
          className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-muted text-foreground"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: index * 0.12 + 0.2 }}
        >
          {artist.genre}
        </motion.span>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Music size={14} className="text-accent shrink-0" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">{artist.genre}</span>
        </div>
        <motion.h3 className="text-lg md:text-xl font-bold tracking-tight group-hover:text-accent transition-colors mb-4" whileHover={{ x: 4 }}>
          {artist.name}
        </motion.h3>
        <div className="flex items-center gap-3">
          <motion.a href={artist.instagram} className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <Instagram size={16} />
          </motion.a>
          <motion.a href="#" className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <ExternalLink size={16} />
          </motion.a>
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

export function Artists() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section
      id="artists"
      ref={ref}
      className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-card/50"
      aria-labelledby="artists-section-title"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <motion.p
            id="artists-section-title"
            className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            The Sound · Featured Artists
          </motion.p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              <GoldShineText scrollTargetRef={ref}>Featured</GoldShineText>
              <br />
              <span className="text-muted-foreground">Artists</span>
            </h2>
            <motion.p
              className="text-muted-foreground max-w-md leading-relaxed"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              We work with talented DJs and producers who share our vision for creating unforgettable house music experiences.
            </motion.p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {artists.map((artist, i) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              index={i}
              isInView={isInView}
              isHovered={hoveredId === artist.id}
              onHover={() => setHoveredId(artist.id)}
              onLeave={() => setHoveredId(null)}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-6">
            Are you a DJ or producer? We&apos;re always looking for fresh talent.
          </p>
          <motion.button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("presetInquiry", { detail: "Submit Your Mix" }))
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold uppercase tracking-wider rounded-full hover:border-accent hover:text-accent transition-colors"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Submit Your Mix
          </motion.button>
        </motion.div>
      </ScrollReveal>
    </section>
  )
}
