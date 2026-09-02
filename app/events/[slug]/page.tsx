import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import { Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Mic2, Ticket, ExternalLink } from "lucide-react"
import { BrandSlashText } from "@/components/brand-slash-text"
import {
  EVENTS,
  type EventItem,
  eventDetailPath,
  eventHeroAbsoluteUrl,
  eventShareTitle,
  getEventBySlug,
} from "@/lib/events"
import {
  fetchPartifulMeta,
  resolveEventDescription,
  resolveEventImage,
  resolveEventTicket,
  type PartifulMeta,
  type ResolvedTicket,
} from "@/lib/partiful"
import { EventBreadcrumb } from "@/components/event-breadcrumb"
import { EventTagBadge } from "@/components/event-tag-badge"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ShimmerImage } from "@/components/shimmer-image"
import { brandPath, brandPlainTitle, getBrands } from "@/lib/data/brands"
import { GalleryPhotoGrid } from "@/components/gallery-photo-grid"
import { GalleryShareRow } from "@/components/gallery-share-row"
import { getGalleryPhotosByDateISO } from "@/lib/data/gallery"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/site"

/** Intrinsic size hint for layout/CLS; actual display preserves aspect ratio (`object-contain`). */
const EVENT_POSTER_WIDTH = 1200
const EVENT_POSTER_HEIGHT = 1800

function EventTicketCta({ ticket, fallbackLabel }: { ticket: ResolvedTicket | "tbd" | null; fallbackLabel?: string }) {
  if (ticket === "tbd") return <EventTicketTbd label={fallbackLabel || "Tickets"} />
  if (!ticket) return null
  return (
    <a
      href={ticket.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 btn-metallic-gold font-semibold tracking-normal rounded-full max-w-full min-w-0"
    >
      <Ticket size={18} />
      {ticket.label}
    </a>
  )
}

function EventTicketTbd({ label }: { label: string }) {
  return (
    <span title="Link TBD" className="inline-flex w-full max-w-full min-w-0" aria-label={`${label}: link TBD`}>
      <button
        type="button"
        aria-disabled="true"
        className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border bg-muted px-6 py-4 font-semibold tracking-normal text-muted-foreground opacity-75"
      >
        <Ticket size={18} />
        {label}
      </button>
    </span>
  )
}

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }))
}

/** Refresh event pages periodically so Past / Upcoming badge matches calendar (see lib/events.ts). */
export const revalidate = 3600

type EventPageParams = { params: Promise<{ slug: string }> }

const fetchPartifulMetaCached = cache(async (partifulLink: string): Promise<PartifulMeta> =>
  fetchPartifulMeta(partifulLink)
)

async function tryFetchPartifulMeta(event: EventItem): Promise<PartifulMeta | null> {
  if (!event.partifulLink) return null
  try {
    return await fetchPartifulMetaCached(event.partifulLink)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: EventPageParams): Promise<Metadata> {
  const { slug } = await params
  const event = getEventBySlug(slug)
  if (!event) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Events",
    }
  }
  const meta = await tryFetchPartifulMeta(event)
  const pageTitle = `LUPFR | ${event.title}`
  const description =
    resolveEventDescription(event, meta)?.trim() ||
    [event.date, event.time, event.location].filter(Boolean).join(" · ")
  const url = `${SITE_URL}${eventDetailPath(slug)}`
  const resolvedImage = resolveEventImage(event, meta)
  const imageUrl = resolvedImage.startsWith("http")
    ? resolvedImage
    : eventHeroAbsoluteUrl(event, SITE_URL)
  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      url,
      images: [
        {
          url: imageUrl,
          width: EVENT_POSTER_WIDTH,
          height: EVENT_POSTER_HEIGHT,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
    },
  }
}

export default async function EventPage({ params }: EventPageParams) {
  const { slug } = await params
  const event = getEventBySlug(slug)
  if (!event) notFound()

  const meta = await tryFetchPartifulMeta(event)
  const resolvedImage = resolveEventImage(event, meta)
  const resolvedDescription = resolveEventDescription(event, meta)
  const ticket = resolveEventTicket(event)

  const shareUrl = `${SITE_URL}${eventDetailPath(event.slug)}`
  const shareTitle = eventShareTitle(event)
  const galleryPhotos = getGalleryPhotosByDateISO(event.dateISO)

  const brand = event.brandTag
    ? getBrands().find((b) => b.title === event.brandTag)
    : undefined
  const brandAccent = brand?.accent

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`

  const eventIndex = EVENTS.findIndex((e) => e.slug === event.slug)
  const prevEvent = EVENTS[(eventIndex + EVENTS.length - 1) % EVENTS.length]
  const nextEvent = EVENTS[(eventIndex + 1) % EVENTS.length]

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-32 sm:pt-36 md:pt-40 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto max-w-[1300px]">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <Link
              href="/#events"
              prefetch
              className="inline-flex items-center gap-2 py-3 pr-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to events list"
            >
              <ArrowLeft size={18} aria-hidden />
            </Link>
            <EventBreadcrumb event={event} />
          </div>

          {/* Comp event-page split: sticky 4/5 poster left, spec column right. */}
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted lg:sticky lg:top-24">
              {resolvedImage ? (
                <ShimmerImage
                  key={event.slug}
                  src={resolvedImage}
                  alt={event.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 650px"
                  priority
                  unoptimized={resolvedImage.startsWith("http")}
                  className="object-cover object-top"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--muted) 0, var(--muted) 10px, var(--card) 10px, var(--card) 20px)",
                  }}
                >
                  <span className="font-mono text-sm uppercase tracking-[0.08em] text-foreground/40">
                    Coming soon
                  </span>
                </div>
              )}
              <EventTagBadge
                event={event}
                className="absolute top-4 left-4 z-10 px-4 py-1.5 text-base sm:text-lg font-semibold tracking-tight rounded-full shadow-md"
              />
            </div>

            <ScrollReveal variant="up" amountIn={0.05} className="lg:pt-2">
              <p
                className={`mb-3 font-mono text-[11px] uppercase tracking-[0.1em] ${brandAccent ? "" : "text-accent"}`}
                style={brandAccent ? { color: brandAccent } : undefined}
              >
                {brand ? (
                  <Link
                    href={brandPath(brand)}
                    aria-label={`More about ${brandPlainTitle(brand)}`}
                    className="transition-opacity hover:opacity-75"
                  >
                    <BrandSlashText text={event.brandTag!} color={brandAccent} />
                  </Link>
                ) : event.brandTag ? (
                  <BrandSlashText text={event.brandTag} color={brandAccent} />
                ) : (
                  "LUPFR Event"
                )}
              </p>
              <h1 className="mb-7 text-4xl sm:text-5xl leading-[1.02]">
                <BrandSlashText text={event.title} />
              </h1>

              <div className="mb-8 flex flex-col gap-4 border-y border-accent/20 py-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground pt-0.5">
                    Lineup
                  </span>
                  <span className="inline-flex items-center gap-2 text-right text-[15px] text-gold-accent">
                    <Mic2 size={14} className="text-accent shrink-0" aria-hidden />
                    {event.subtitle || "TBD"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground pt-0.5">
                    Location
                  </span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-right text-[15px] text-foreground transition-colors hover:text-accent"
                    aria-label={`Open ${event.location} in Google Maps (opens in new tab)`}
                  >
                    <MapPin size={14} className="text-accent shrink-0" aria-hidden />
                    <span className="underline-offset-4 hover:underline">{event.location}</span>
                  </a>
                </div>
                {/* Split into its own Date row + Time row (owner punch list,
                   2026-09-02, iPhone screenshot: "Each event page should
                   have its own row for when and time. Not both on the
                   same") — was one "When" row cramming both onto one line;
                   now matches the Lineup/Location row pattern above. */}
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground pt-0.5">
                    Date
                  </span>
                  <span className="inline-flex items-center gap-2 text-right text-[15px] text-foreground">
                    <Calendar size={14} className="text-accent shrink-0" aria-hidden />
                    {event.date}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground pt-0.5">
                    Time
                  </span>
                  <span className="inline-flex items-center gap-2 text-right text-[15px] text-foreground">
                    <Clock size={14} className="text-accent shrink-0" aria-hidden />
                    {event.time}
                  </span>
                </div>
              </div>

              <EventTicketCta ticket={ticket} fallbackLabel={event.ticketLabel?.trim()} />

              {resolvedDescription ? (
                <p className="mt-8 text-muted-foreground leading-relaxed">
                  {resolvedDescription}
                </p>
              ) : null}

              {galleryPhotos.length > 0 ? (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="mb-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-muted-foreground">Gallery</h2>
                  <GalleryPhotoGrid
                    photos={galleryPhotos}
                    dateSections={false}
                    className="grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
                  />
                </div>
              ) : null}

              {event.contentLinks && event.contentLinks.length > 0 ? (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-muted-foreground">Content links</h2>
                  <div className="flex flex-wrap gap-3">
                    {event.contentLinks.map((link) => (
                      <a
                        key={`${link.label}:${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground/90 transition-colors hover:border-accent hover:text-accent"
                      >
                        <ExternalLink size={16} className="shrink-0" aria-hidden />
                        <span className="truncate">{link.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Share this event</p>
                <p className="text-muted-foreground mb-3 text-sm">
                  Copy the link or use a button — share it wherever your people are.
                </p>
                <GalleryShareRow
                  shareUrl={shareUrl}
                  shareTitle={shareTitle}
                  groupAriaLabel="Share this event"
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Prev/next event nav — services-detail parity (owner request 2026-07-19). */}
          <nav
            aria-label="More events"
            className="mt-14 flex items-center justify-between gap-4 border-t border-border pt-8"
          >
            <Link
              href={eventDetailPath(prevEvent.slug)}
              aria-label={`Previous event: ${prevEvent.title}`}
              className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} className="shrink-0" aria-hidden />
              <span className="truncate">{prevEvent.title}</span>
            </Link>
            <Link
              href="/events"
              className="hidden shrink-0 text-sm text-muted-foreground transition-colors hover:text-accent sm:inline-flex"
            >
              All Events
            </Link>
            <Link
              href={eventDetailPath(nextEvent.slug)}
              aria-label={`Next event: ${nextEvent.title}`}
              className="inline-flex min-w-0 items-center justify-end gap-2 text-right text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <span className="truncate">{nextEvent.title}</span>
              <ArrowRight size={16} className="shrink-0" aria-hidden />
            </Link>
          </nav>
        </div>
      </div>
      <Footer />
    </main>
  )
}
