"use client"

import { memo } from "react"
import Image from "next/image"
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { Instagram, Music, ExternalLink } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { getArtists, type ArtistItem } from "@/lib/data/artists"
import { cn } from "@/lib/utils"

const ARTIST_IMAGE_SIZE = 400

const artists = getArtists()

/** Spotify track URL -> embed URL. */
function spotifyEmbedUrl(trackUrl: string): string {
  const m = trackUrl.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
  const id = m ? m[1] : ""
  return id ? `https://open.spotify.com/embed/track/${id}` : ""
}

/** SoundCloud track URL -> embed player URL. */
function soundcloudEmbedUrl(trackUrl: string): string {
  const encoded = encodeURIComponent(trackUrl.startsWith("http") ? trackUrl : `https://${trackUrl}`)
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false`
}

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
  const [imageReady, setImageReady] = useState(false)
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
      className="group relative rounded-2xl bg-card overflow-hidden"
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {/* Card: image, then full blur overlay, then name+player on top of blur so no gap + player clickable */}
      <div className="relative w-full rounded-2xl overflow-hidden">
        {/* Image + bio overlay on hover */}
        <div className="relative rounded-t-2xl overflow-hidden bg-card">
          <motion.div
            className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-muted"
            animate={{ scale: isHovered ? 1.03 : 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {!imageError ? (
              <div
                className={cn(
                  "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
                  "motion-safe:transition-opacity motion-safe:duration-300",
                  "motion-reduce:transition-none",
                  imageReady ? "opacity-0" : "opacity-100"
                )}
                aria-hidden
              />
            ) : null}
            {imageError ? (
              <img
                src={FALLBACK_IMAGE}
                alt={`${artist.name}, ${artist.genre}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={artist.image}
                alt={`${artist.name}, ${artist.genre}`}
                width={ARTIST_IMAGE_SIZE}
                height={ARTIST_IMAGE_SIZE}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                className={cn(
                  "relative z-[1] w-full h-full object-cover",
                  "motion-safe:transition-opacity motion-safe:duration-300",
                  "motion-reduce:transition-none",
                  imageReady ? "opacity-100" : "opacity-0"
                )}
                onError={() => setImageError(true)}
                onLoadingComplete={() => setImageReady(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-70 pointer-events-none" />
            <motion.span
              className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold tracking-tight rounded-full bg-muted/90 text-foreground backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.12 + 0.2 }}
            >
              {artist.genre}
            </motion.span>
          </motion.div>
          {/* Bio overlay — only over image, revealed on hover */}
          <motion.div
            className="absolute inset-0 rounded-t-2xl flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/80 to-transparent backdrop-blur-[2px] pointer-events-none"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.p
              className="p-5 md:p-6 text-sm text-muted-foreground leading-relaxed tracking-wide font-[450] antialiased line-clamp-3"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {artist.bio}
            </motion.p>
          </motion.div>
        </div>

        {/* Name, links (above Listen), player — always visible */}
        <div className="p-4 md:p-5 rounded-b-2xl bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Music size={14} className="text-accent shrink-0" />
            <span className="text-xs tracking-normal text-muted-foreground">{artist.genre}</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
            {artist.name}
          </h3>
          <div className="flex items-center gap-3 flex-wrap mt-4">
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
          {artist.featuredTrack && (
            <div className="mt-4 w-full pt-4 border-t border-border/80">
              <span className="text-xs font-semibold tracking-tight text-accent">Listen</span>
              <div className="mt-1.5 rounded-lg overflow-hidden bg-muted/80 border border-border/80 w-full">
                {artist.featuredTrack.platform === "spotify" && spotifyEmbedUrl(artist.featuredTrack.url) && (
                  <iframe
                    src={spotifyEmbedUrl(artist.featuredTrack.url)}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="border-0"
                    title={`Listen to ${artist.name} on Spotify`}
                  />
                )}
                {artist.featuredTrack.platform === "soundcloud" && (
                  <iframe
                    src={soundcloudEmbedUrl(artist.featuredTrack.url)}
                    width="100%"
                    height="166"
                    allow="autoplay; encrypted-media; fullscreen"
                    loading="lazy"
                    className="border-0"
                    title={`Listen to ${artist.name} on SoundCloud`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
})

export function Artists() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  /* The featured artists section is a grid of artist cards. */
  return (
    <section
      id="artists"
      ref={ref}
      className="pt-4 sm:pt-6 md:pt-8 pb-20 sm:pb-24 md:pb-32 px-4 sm:px-6 relative overflow-hidden bg-card/50"
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
            className="text-gold-accent tracking-tight text-sm mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            The Sound · Featured Artists
          </motion.p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="lupfr-heading-split-leading">
              <GoldShineText scrollTargetRef={ref}>Featured</GoldShineText>
              <br />
              <span className="lupfr-heading-subline">Artists</span>
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
            className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold tracking-normal rounded-full hover:border-accent hover:text-accent transition-colors"
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
