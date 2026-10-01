"use client"

import { memo, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { m, useInView, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { Instagram, Music, ExternalLink, Youtube } from "lucide-react"
import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { TextReveal } from "@/components/text-reveal"
import { artistSlug, getArtists, type ArtistItem } from "@/lib/data/artists"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const ARTIST_IMAGE_SIZE = 400
const HOME_FEATURED_ARTIST_COUNT = 6

const artists = getArtists()
const featuredArtists = artists.slice(0, HOME_FEATURED_ARTIST_COUNT)
const featuredArtistIds = new Set(featuredArtists.map((artist) => artist.id))

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
    <div ref={embedRef} className="mt-1 w-full min-w-0 pt-3.5 border-t border-accent/30">
      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted-foreground">Listen</span>
      <div className="mt-1.5 rounded-md overflow-hidden bg-muted/90 border border-accent/40 shadow-[0_0_12px_rgba(212,175,55,0.08)] hover:border-accent/70 transition-colors w-full min-w-0 max-w-full">
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
            className="border-0 block w-full max-w-full"
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

      {/* Name, links, and stacked track player */}
      <div className="flex-1 p-4 md:p-5 rounded-b-sm bg-card flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Music size={14} className="text-accent shrink-0" />
            <span className="text-xs tracking-[0.08em] text-muted-foreground">{artist.genre}</span>
          </div>

          {/* Artist name + social icons, with the player stacked underneath at full card width */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
              <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground break-words">
                {artist.name}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {hasSpotify && (
                  <m.a
                    href={artist.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-[24px] bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Spotify"
                  >
                    <ExternalLink size={12} />
                  </m.a>
                )}
                {hasAppleMusic && (
                  <m.a
                    href={artist.appleMusic}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-[24px] bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Apple Music"
                  >
                    <Music size={12} />
                  </m.a>
                )}
                {artist.instagram && (
                  <m.a
                    href={artist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-[24px] bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Instagram"
                  >
                    <Instagram size={12} />
                  </m.a>
                )}
                {hasYoutube && (
                  <m.a
                    href={artist.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-[24px] bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="YouTube"
                  >
                    <Youtube size={12} />
                  </m.a>
                )}
                {hasSoundcloud && (
                  <m.a
                    href={artist.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center size-[24px] bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="SoundCloud"
                  >
                    <ExternalLink size={12} />
                  </m.a>
                )}
              </div>
            </div>

            {/* Player stacked below the artist name, full card width */}
            {artist.featuredTrack && featuredTrackEmbedUrl && (
              <div className="w-full min-w-0">
                <FeaturedTrackEmbed
                  featuredTrackEmbedUrl={featuredTrackEmbedUrl}
                  platform={artist.featuredTrack.platform}
                  artistName={artist.name}
                  label={featuredTrackLabel}
                />
              </div>
            )}
          </div>
        </div>
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

function ArtistGrid({
  items,
  className,
  hoveredId,
  selectedId = null,
  isMobile,
  onHover,
  onLeave,
}: {
  items: ArtistItem[]
  className?: string
  hoveredId: number | null
  selectedId?: number | null
  isMobile: boolean
  onHover: (id: number) => void
  onLeave: () => void
}) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", className)}>
      {items.map((artist) => (
        <div
          key={artist.id}
          id={`artist-${artistSlug(artist.name)}`}
          aria-current={selectedId === artist.id ? "true" : undefined}
          className={cn("h-full rounded-sm", selectedId === artist.id && "ring-1 ring-accent")}
        >
          <ArtistCard
            artist={artist}
            isHovered={hoveredId === artist.id}
            isMobile={isMobile}
            onHover={() => onHover(artist.id)}
            onLeave={onLeave}
          />
        </div>
      ))}
    </div>
  )
}

function ArtistRoster() {
  // Owner request 2026-07-21: home roster is A–Z; featured-card names stay gold + bold.
  const rosterArtists = [...artists].sort((a, b) => a.name.localeCompare(b.name))
  // Repeat list for continuous marquee loop
  const marqueeItems = [...rosterArtists, ...rosterArtists]

  return (
    <div
      aria-label="Artist roster ticker"
      className="roster-marquee border-y border-border py-5 text-sm font-medium"
    >
      <div className="roster-marquee-track flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
        {marqueeItems.map((artist, idx) => (
          <div key={`${artist.id}-${idx}`} className="flex items-center gap-8 sm:gap-12 shrink-0">
            <Link
              href={`/artists?artist=${artistSlug(artist.name)}`}
              aria-label={`View ${artist.name} in the artists directory`}
              className="rounded-sm px-1 decoration-accent underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-none whitespace-nowrap"
            >
              {featuredArtistIds.has(artist.id) ? (
                <span className="font-bold">
                  <GoldShineText variant="static">{artist.name}</GoldShineText>
                </span>
              ) : (
                <span className="text-muted-foreground transition-colors hover:text-accent">{artist.name}</span>
              )}
            </Link>
            <span aria-hidden="true" className="text-accent/40 select-none font-bold text-xs">
              /
            </span>
          </div>
        ))}
      </div>
    </div>
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
  const ref = useRef<HTMLElement>(null)
  const wallArtists = artists.slice(0, 8)

  return (
    <section
      id="artists"
      ref={ref}
      className="border-b border-border px-4 py-24 sm:px-6 lg:px-12 lg:py-[120px]"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Music & Entertainment
            </p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(44px,5vw,68px)] font-extrabold uppercase leading-[0.92] tracking-[-0.025em]">
              <GoldShineText scrollTargetRef={ref}>Past Artists</GoldShineText>
            </h2>
          </div>
          <Link href="/artists" className="w-fit border-b border-accent pb-1 text-sm font-medium text-accent">
            View Artist Roster →
          </Link>
        </div>

        <div className="grid auto-rows-[clamp(210px,22vw,300px)] grid-cols-2 gap-3 md:grid-cols-4">
          {wallArtists.map((artist, i) => {
            const large = i === 0 || i === 5
            const href = artist.spotify || `/artists?artist=${artistSlug(artist.name)}`
            const external = Boolean(artist.spotify)

            return (
              <a
                key={artist.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`group relative overflow-hidden rounded-sm border border-border bg-card ${large ? "col-span-2 row-span-2 md:col-span-2" : ""}`}
              >
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes={large ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className="object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080706]/90 via-transparent to-black/10" />
                <span className="absolute left-3 top-3 font-mono text-[10px] text-white/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1.5">
                  <span className={`font-[family-name:var(--font-barlow-condensed)] font-extrabold uppercase leading-[0.9] text-white ${large ? "text-[clamp(34px,5vw,64px)]" : "text-[clamp(24px,3vw,38px)]"}`}>
                    {artist.name}
                  </span>
                  <span className="flex items-center justify-between gap-3 font-mono text-[9.5px] uppercase tracking-[0.13em] text-[#e8caa0]">
                    <span>{artist.genre}</span>
                    <span className="text-white/70">{external ? "Spotify ↗" : "Profile →"}</span>
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </ScrollReveal>
    </section>
  )
}

export function ArtistsDirectory() {
  const [sort, setSort] = useState<"featured" | "az">("featured")
  const [genre, setGenre] = useState("all")
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const isMobile = useIsMobile() ?? true

  /* Roster deep link (`/artists?artist=<slug>`): highlight + scroll to the card.
     Read once on mount instead of useSearchParams so the page stays a static
     prerender without a Suspense boundary; roster links always arrive cross-route. */
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("artist")
    if (!slug) return
    const match = artists.find((artist) => artistSlug(artist.name) === slug)
    if (!match) return
    setSelectedId(match.id)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    requestAnimationFrame(() => {
      document.getElementById(`artist-${slug}`)?.scrollIntoView?.({
        block: "center",
        behavior: reduceMotion ? "auto" : "smooth",
      })
    })
  }, [])
  const genres = useMemo(
    () => [...new Set(artists.map((artist) => artist.genre))].sort((a, b) => a.localeCompare(b)),
    []
  )
  const visibleArtists = useMemo(() => {
    const filtered = genre === "all" ? artists : artists.filter((artist) => artist.genre === genre)
    return sort === "az"
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      : filtered
  }, [genre, sort])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3 sm:mb-10">
        {(["featured", "az"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={sort === value}
            onClick={() => setSort(value)}
            className={cn(
              "min-h-11 rounded-full border px-5 text-sm font-medium transition-colors",
              sort === value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-secondary text-foreground hover:border-accent"
            )}
          >
            {value === "featured" ? "Featured" : "A–Z"}
          </button>
        ))}
        <label className="sr-only" htmlFor="artist-genre">Filter artists by genre</label>
        <select
          id="artist-genre"
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          className="min-h-11 rounded-full border border-border bg-secondary px-5 text-sm text-foreground outline-none transition-colors hover:border-accent focus-visible:border-accent"
        >
          <option value="all">All Genres</option>
          {genres.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      <ArtistGrid
        items={visibleArtists}
        hoveredId={hoveredId}
        selectedId={selectedId}
        isMobile={isMobile}
        onHover={setHoveredId}
        onLeave={() => setHoveredId(null)}
      />
      {visibleArtists.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No artists match this genre.</p>
      ) : null}
    </div>
  )
}
