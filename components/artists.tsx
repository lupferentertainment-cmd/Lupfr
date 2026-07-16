"use client"

import { memo, type ReactNode } from "react"
import Image from "next/image"
import { m, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState } from "react"
import { Instagram, Music, ExternalLink, Youtube } from "lucide-react"
import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { getArtists, type ArtistItem } from "@/lib/data/artists"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const ARTIST_IMAGE_SIZE = 400
const ARTISTS_PER_DESKTOP_SLIDE = 6

function getDesktopArtistSlides(items: ArtistItem[]): ArtistItem[][] {
  const count = Math.ceil(items.length / ARTISTS_PER_DESKTOP_SLIDE)
  return Array.from({ length: count }, (_, i) =>
    items.slice(i * ARTISTS_PER_DESKTOP_SLIDE, (i + 1) * ARTISTS_PER_DESKTOP_SLIDE)
  )
}

const artists = getArtists()
const desktopArtistSlides = getDesktopArtistSlides(artists)
const mobileArtistSlides = artists.map((a) => [a])

/** Spotify track URL -> embed URL. */
function spotifyEmbedUrl(trackUrl: string): string {
  const match = trackUrl.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
  const id = match ? match[1] : ""
  return id ? `https://open.spotify.com/embed/track/${id}?theme=0` : ""
}

/** SoundCloud track URL -> embed player URL. */
function soundcloudEmbedUrl(trackUrl: string): string {
  const encoded = encodeURIComponent(trackUrl.startsWith("http") ? trackUrl : `https://${trackUrl}`)
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23a88234&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%236b7280'/%3E%3Cstop offset='100%25' style='stop-color:%234b5563'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='48'%3EDJ%3C/text%3E%3C/svg%3E"

/** Mount Spotify/SoundCloud iframe only when the card is near the viewport. */
function FeaturedTrackEmbed({
  featuredTrackEmbedUrl,
  platform,
  artistName,
  label,
}: {
  featuredTrackEmbedUrl: string
  platform: "spotify" | "soundcloud"
  artistName: string
  label: string
}) {
  const embedRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(embedRef, { once: true, margin: "200px" })
  const height = platform === "spotify" ? "80" : "166"

  return (
    <div ref={embedRef} className="mt-4 w-full pt-4 border-t border-border/80">
      <span className="text-xs font-semibold tracking-tight text-accent">Listen</span>
      <div className="mt-1.5 rounded-lg overflow-hidden bg-muted/80 border border-border/80 w-full">
        {isInView ? (
          <iframe
            src={featuredTrackEmbedUrl}
            width="100%"
            height={height}
            loading="lazy"
            allow={
              platform === "spotify"
                ? "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                : "autoplay; encrypted-media; fullscreen"
            }
            className="border-0"
            title={`Listen to ${artistName} on ${label}`}
          />
        ) : (
          <div
            className="w-full bg-muted"
            style={{ height: `${height}px` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}

/** Tilt springs live here so ArtistCard never creates them on touch/mobile. */
function ArtistCardTiltShell({
  children,
  onHover,
  onLeave,
}: {
  children: ReactNode
  onHover: () => void
  onLeave: () => void
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
      className="group relative h-full w-full flex flex-col rounded-sm bg-card overflow-hidden"
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
    </m.article>
  )
}

const ArtistCard = memo(function ArtistCard({
  artist,
  isHovered,
  isMobile,
  onHover,
  onLeave,
}: {
  artist: ArtistItem
  isHovered: boolean
  isMobile: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const [imageError, setImageError] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const enableTilt = !isMobile

  const hasSpotify = "spotify" in artist && artist.spotify
  const hasAppleMusic = "appleMusic" in artist && artist.appleMusic
  const hasYoutube = "youtube" in artist && artist.youtube
  const hasSoundcloud = "soundcloud" in artist && artist.soundcloud
  const featuredTrackEmbedUrl = artist.featuredTrack
    ? artist.featuredTrack.platform === "spotify"
      ? spotifyEmbedUrl(artist.featuredTrack.url)
      : soundcloudEmbedUrl(artist.featuredTrack.url)
    : ""
  const featuredTrackLabel = artist.featuredTrack?.platform === "spotify" ? "Spotify" : "SoundCloud"

  const body = (
    <div className="relative w-full flex-1 flex flex-col rounded-sm overflow-hidden">
      {/* Image + bio overlay on hover */}
      <div className="relative rounded-t-sm overflow-hidden bg-card">
        <m.div
          className="relative aspect-square w-full overflow-hidden rounded-t-sm bg-muted"
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
            <Image
              src={FALLBACK_IMAGE}
              alt={`${artist.name}, ${artist.genre}`}
              width={ARTIST_IMAGE_SIZE}
              height={ARTIST_IMAGE_SIZE}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              onLoad={() => setImageReady(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-70 pointer-events-none" />
          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold tracking-tight rounded-full bg-muted/90 text-foreground backdrop-blur-sm">
            {artist.genre}
          </span>
        </m.div>
        {/* Bio overlay — desktop hover only; not rendered on mobile to avoid compositing cost */}
        {!isMobile && (
          <m.div
            className="absolute inset-0 rounded-t-sm flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/80 to-transparent backdrop-blur-[2px] pointer-events-none"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <m.p
              className="p-5 md:p-6 text-sm text-muted-foreground leading-relaxed tracking-wide font-[450] antialiased line-clamp-3"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {artist.bio}
            </m.p>
          </m.div>
        )}
      </div>

      {/* Name, links (above Listen), player — always visible */}
      <div className="flex-1 p-4 md:p-5 rounded-b-sm bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Music size={14} className="text-accent shrink-0" />
          <span className="text-xs tracking-normal text-muted-foreground">{artist.genre}</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
          {artist.name}
        </h3>
        <div className="flex items-center gap-3 flex-wrap mt-4">
          {hasSpotify && (
            <m.a
              href={artist.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Spotify"
            >
              <ExternalLink size={16} />
            </m.a>
          )}
          {hasAppleMusic && (
            <m.a
              href={artist.appleMusic}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Apple Music"
            >
              <Music size={16} />
            </m.a>
          )}
          {artist.instagram && (
            <m.a
              href={artist.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </m.a>
          )}
          {hasYoutube && (
            <m.a
              href={artist.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              aria-label="YouTube"
            >
              <Youtube size={16} />
            </m.a>
          )}
          {hasSoundcloud && (
            <m.a
              href={artist.soundcloud}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              aria-label="SoundCloud"
            >
              <ExternalLink size={16} />
            </m.a>
          )}
        </div>
        {artist.featuredTrack && featuredTrackEmbedUrl && (
          <FeaturedTrackEmbed
            featuredTrackEmbedUrl={featuredTrackEmbedUrl}
            platform={artist.featuredTrack.platform}
            artistName={artist.name}
            label={featuredTrackLabel}
          />
        )}
      </div>
    </div>
  )

  if (enableTilt) {
    return (
      <ArtistCardTiltShell onHover={onHover} onLeave={onLeave}>
        {body}
      </ArtistCardTiltShell>
    )
  }

  return (
    <m.article
      className="group relative h-full w-full flex flex-col rounded-sm bg-card overflow-hidden"
      onMouseLeave={onLeave}
    >
      {body}
    </m.article>
  )
})

function ArtistCarousel({
  hoveredId,
  isMobile,
  onHover,
  onLeave,
}: {
  hoveredId: number | null
  isMobile: boolean
  onHover: (id: number) => void
  onLeave: () => void
}) {
  const slides = isMobile ? mobileArtistSlides : desktopArtistSlides

  return (
    <Carousel opts={{ align: "start", containScroll: "trimSnaps" }} className="w-full">
      <CarouselContent className="-ml-4 md:-ml-6" viewportClassName="py-2 md:py-3">
        {slides.map((slide) => (
          /* flex (not h-full) so slides stretch to the tallest and card heights
             stay uniform across slides — same fix as the events carousels. */
          <CarouselItem key={slide.map((artist) => artist.id).join("-")} className="pl-4 md:pl-6 basis-full flex">
            {isMobile ? (
              <ArtistCard
                artist={slide[0]}
                isHovered={hoveredId === slide[0].id}
                isMobile={isMobile}
                onHover={() => onHover(slide[0].id)}
                onLeave={onLeave}
              />
            ) : (
              <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {slide.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    isHovered={hoveredId === artist.id}
                    isMobile={isMobile}
                    onHover={() => onHover(artist.id)}
                    onLeave={onLeave}
                  />
                ))}
              </div>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      {slides.length > 1 ? <CarouselPrevious className="left-1 top-[45%] sm:-left-4 lg:-left-10" /> : null}
      {slides.length > 1 ? <CarouselNext className="right-1 top-[45%] sm:-right-4 lg:-right-10" /> : null}
      <CarouselDots />
    </Carousel>
  )
}

/**
 * Mobile black-screen regression guard: phones NEVER mount whileInView
 * opacity-0 wrappers here — fast scroll could leave the section invisible.
 * Desktop gets the same entrance reveal as sibling sections.
 */
function ArtistsRevealShell({
  isMobile,
  className,
  children,
}: {
  isMobile: boolean
  className?: string
  children: ReactNode
}) {
  if (isMobile) return <div className={className}>{children}</div>
  return (
    <ScrollReveal variant="up" freezeAfterReveal className={className}>
      {children}
    </ScrollReveal>
  )
}

export function Artists() {
  const ref = useRef(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const isMobile = useIsMobile() ?? true

  /* The featured artists section is a grid of artist cards. */
  return (
    <section
      id="artists"
      ref={ref}
      className="pt-4 sm:pt-5 md:pt-6 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 relative overflow-hidden bg-card/50"
      aria-labelledby="artists-section-title"
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        <ArtistsRevealShell isMobile={isMobile} className="mb-10 sm:mb-12 md:mb-14">
          <p
            id="artists-section-title"
            className="lupfr-section-kicker mb-4"
          >
            The Sound · Featured Artists
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="lupfr-heading-split-leading">
              <GoldShineText scrollTargetRef={ref}>Featured</GoldShineText>
              <br />
              <span className="lupfr-heading-subline">Artists</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              We work with talented DJs, bands, and musicians who share our vision for creating unforgettable music experiences.
            </p>
          </div>
        </ArtistsRevealShell>

        <ArtistsRevealShell isMobile={isMobile}>
          <ArtistCarousel
            hoveredId={hoveredId}
            isMobile={isMobile}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
          />
        </ArtistsRevealShell>

        {/* CTA */}
        <ArtistsRevealShell isMobile={isMobile} className="mt-6 text-center">
          <p className="text-muted-foreground mb-6">
            Are you a DJ or producer? We&apos;re always looking for fresh talent.
          </p>
          <m.button
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
          </m.button>
        </ArtistsRevealShell>
      </div>
    </section>
  )
}
