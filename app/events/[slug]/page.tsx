import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Clock, ArrowLeft, Ticket, ExternalLink } from "lucide-react"
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
import { EventDetailHeroImage } from "@/components/event-detail-hero-image"
import { EventTagBadge } from "@/components/event-tag-badge"
import { GalleryShareRow } from "@/components/gallery-share-row"
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
      className="inline-flex items-center gap-2 px-6 py-4 btn-metallic-gold font-semibold tracking-normal rounded-full max-w-full min-w-0"
    >
      <Ticket size={18} />
      {ticket.label}
    </a>
  )
}

function EventTicketTbd({ label }: { label: string }) {
  return (
    <span title="Link TBD" className="inline-flex max-w-full min-w-0" aria-label={`${label}: link TBD`}>
      <button
        type="button"
        aria-disabled="true"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-border bg-muted px-6 py-4 font-semibold tracking-normal text-muted-foreground opacity-75"
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

async function tryFetchPartifulMeta(event: EventItem): Promise<PartifulMeta | null> {
  if (!event.partifulLink) return null
  try {
    return await fetchPartifulMeta(event.partifulLink)
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

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-32 sm:pt-36 md:pt-40 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
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

          <div className="rounded-2xl overflow-hidden bg-card border border-border mb-10 shadow-xl">
            <div className="relative">
              {resolvedImage ? (
                <EventDetailHeroImage
                  key={event.slug}
                  src={resolvedImage}
                  alt={event.title}
                  width={EVENT_POSTER_WIDTH}
                  height={EVENT_POSTER_HEIGHT}
                  sizes="(max-width: 768px) 100vw, 896px"
                  unoptimized={resolvedImage.startsWith("http")}
                />
              ) : (
                <div className="aspect-[2/3] w-full bg-gradient-to-b from-muted to-card" />
              )}
              <EventTagBadge
                event={event}
                className="absolute top-4 left-4 z-10 px-4 py-1.5 text-base sm:text-lg font-semibold tracking-tight rounded-full shadow-md"
              />
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                {event.title}
              </h1>
              {event.subtitle ? (
                <p className="text-xl text-muted-foreground mb-6">{event.subtitle}</p>
              ) : null}

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar size={18} className="text-accent shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock size={18} className="text-accent shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin size={18} className="text-accent shrink-0" />
                  <span>{event.location}</span>
                </div>
              </div>

              {resolvedDescription ? (
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {resolvedDescription}
                </p>
              ) : null}

              <EventTicketCta ticket={ticket} fallbackLabel={event.ticketLabel?.trim()} />

              {event.contentLinks && event.contentLinks.length > 0 ? (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">Content links</h2>
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
