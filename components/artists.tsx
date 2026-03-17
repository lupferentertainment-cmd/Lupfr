"use client"

import { memo } from "react"
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { Instagram, Music, ExternalLink } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"

const artists = [
  {
    id: 1,
    name: "Where's West?",
    genre: "Indie",
    image: "/artists/wheres_west.jpeg",
    bio: "LA-based indie band born in a college laundry room. From backyard shows to Sweetwater and Wonderfront—rock, indie, dance and funk with a 70s feel and California coast energy.",
    spotify: "https://open.spotify.com/artist/7380t6i98gEs1ysixt1cTO",
    appleMusic: "https://music.apple.com/artist/wheres-west",
    instagram: "https://www.instagram.com/wheres__west/",
  },
  {
    id: 2,
    name: "HLWA",
    genre: "Melodic House",
    image: "/artists/hlwa.jpeg",
    bio: "Melodic house artist from Ann Arbor. Emotive, driving cuts on Beatport and Apple Music—think soaring leads and deep grooves that move the room.",
    spotify: "https://open.spotify.com/artist/1uFstDfzHjdGuzOrnrzOTy",
    appleMusic: "https://music.apple.com/artist/hlwa",
    instagram: "https://www.instagram.com/hlwamusic/",
  },
  {
    id: 3,
    name: "Tommy Guala",
    genre: "Deep House",
    image: "/artists/tommy_guala.jpg",
    bio: "Artist and DJ with a deep house edge. Soulful grooves and heady vibes across SoundCloud and Beatport—built for late nights and locked-in crowds.",
    spotify: "https://open.spotify.com/artist/5gXe3UJr2VZq0bMKAgxsTY",
    appleMusic: "https://music.apple.com/artist/tommy-guala",
    instagram: "https://www.instagram.com/tommy.guala/",
  },
  {
    id: 4,
    name: "Mike Stern",
    genre: "Afro House",
    image: "/artists/mike_stern.jpeg",
    bio: "Afro house selector bringing percussion-heavy, sun-soaked grooves to the Bay. Rhythmic, hypnotic sets that keep the floor moving.",
    spotify: "https://open.spotify.com/artist/6AKgtbnwiE2SIzlIChxLRZ",
    instagram: "https://www.instagram.com/mikeystern/",
  },
  {
    id: 5,
    name: "Operator SF",
    genre: "Deep House",
    image: "/artists/operator_sf.png",
    bio: "SF house crew behind feel-good deep house sessions across the city—from Savoy Tivoli to Baker Beach. High-energy, dance-first vibes.",
    instagram: "https://www.instagram.com/operator.sf/",
  },
  {
    id: 6,
    name: "LUPFR",
    genre: "Progressive House",
    image: "/artists/lupfr.jpeg",
    bio: "The sound behind LUPFR Entertainment. Progressive house and curation that match SF's energy—boat parties, warehouses, and nights that stick.",
    instagram: "https://www.instagram.com/lupfr_music/",
  },
]

type ArtistItem = (typeof artists)[number]

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236b7280'/%3E%3Cstop offset='100%25' style='stop-color:%234b5563'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='48'%3EDJ%3C/text%3E%3C/svg%3E"

const ArtistCard = memo(function ArtistCard({
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

  const hasSpotify = "spotify" in artist && artist.spotify
  const hasAppleMusic = "appleMusic" in artist && artist.appleMusic

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl bg-card border border-border hover:border-accent/50 transition-[border-color] duration-150 ease-out"
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {/* Single card: image always visible; overlay fades in on hover (no flip) */}
      <div className="relative w-full rounded-2xl overflow-hidden">
        {/* Image layer — subtle scale on hover */}
        <div className="rounded-2xl overflow-hidden bg-card">
          <motion.div
            className="aspect-square w-full overflow-hidden relative bg-muted"
            animate={{ scale: isHovered ? 1.03 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={imageSrc}
              alt={`${artist.name}, ${artist.genre}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-70 pointer-events-none" />
            <motion.span
              className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-muted text-foreground"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.12 + 0.2 }}
            >
              {artist.genre}
            </motion.span>
          </motion.div>
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-2 mb-1">
              <Music size={14} className="text-accent shrink-0" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{artist.genre}</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              {artist.name}
            </h3>
          </div>
        </div>

        {/* Hover overlay: fade + gentle slide up — seamless, no flip */}
        <motion.div
          className="absolute inset-0 rounded-2xl flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/80 to-transparent backdrop-blur-[2px]"
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? "auto" : "none",
          }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="p-5 md:p-6 flex flex-col justify-end min-h-0"
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 12,
            }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {artist.genre}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-foreground mt-1 mb-3">
              {artist.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed tracking-wide font-[450] antialiased line-clamp-3">
              {artist.bio}
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-4 pt-4 border-t border-border/80">
              {hasSpotify && (
                <motion.a
                  href={artist.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Spotify"
                >
                  <ExternalLink size={16} />
                </motion.a>
              )}
              {hasAppleMusic && (
                <motion.a
                  href={artist.appleMusic}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Apple Music"
                >
                  <Music size={16} />
                </motion.a>
              )}
              {artist.instagram && (
                <motion.a
                  href={artist.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </motion.a>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  )
})

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
              We work with talented DJs, bands, and musicians who share our vision for creating unforgettable music experiences.
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
