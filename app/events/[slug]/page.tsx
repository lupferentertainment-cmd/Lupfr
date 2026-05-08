import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Clock, ArrowLeft, Ticket, ExternalLink } from "lucide-react"
import {
  EVENTS,
  eventDetailPath,
  eventHeroAbsoluteUrl,
  eventShareTitle,
  getEventBySlug,
} from "@/lib/events"
import { EventDetailHeroImage } from "@/components/event-detail-hero-image"
import { EventTagBadge } from "@/components/event-tag-badge"
import { GalleryShareRow } from "@/components/gallery-share-row"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/site"

/** Intrinsic size hint for layout/CLS; actual display preserves aspect ratio (`object-contain`). */
const EVENT_POSTER_WIDTH = 1200
const EVENT_POSTER_HEIGHT = 1800

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }))
}

/** Refresh event pages periodically so Past / Upcoming badge matches calendar (see lib/events.ts). */
export const revalidate = 3600

type EventPageParams = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: EventPageParams): Promise<Metadata> {
  const { slug } = await params
  const event = getEventBySlug(slug)
  if (!event) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Events",
    }
  }
  const pageTitle = `LUPFR | ${event.title}`
  const description =
    event.description?.trim() ||
    [event.date, event.time, event.location].filter(Boolean).join(" · ")
  const url = `${SITE_URL}${eventDetailPath(slug)}`
  const imageUrl = eventHeroAbsoluteUrl(event, SITE_URL)
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

  const shareUrl = `${SITE_URL}${eventDetailPath(event.slug)}`
  const shareTitle = eventShareTitle(event)

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-32 sm:pt-36 md:pt-40 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/#events"
            prefetch
            className="inline-flex items-center gap-2 py-3 pr-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors mb-8 relative z-10"
            aria-label="Back to events list"
          >
            <ArrowLeft size={18} aria-hidden />
            <span className="text-sm tracking-normal">Back to events</span>
          </Link>

          <div className="rounded-2xl overflow-hidden bg-card border border-border mb-10 shadow-xl">
            <div className="relative">
              <EventDetailHeroImage
                key={event.slug}
                src={event.image}
                alt={event.title}
                width={EVENT_POSTER_WIDTH}
                height={EVENT_POSTER_HEIGHT}
                sizes="(max-width: 768px) 100vw, 896px"
                unoptimized={event.image.startsWith("http")}
              />
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

              {event.description ? (
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {event.description}
                </p>
              ) : null}

              {event.ticketLink ? (
                <a
                  href={event.ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-4 btn-metallic-gold font-semibold tracking-normal rounded-full max-w-full min-w-0"
                >
                  <Ticket size={18} />
                  {event.ticketLabel?.trim() || "Tickets"}
                </a>
              ) : null}

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
