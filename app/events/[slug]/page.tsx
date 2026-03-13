import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Clock, ArrowLeft, Ticket } from "lucide-react"
import { getEventBySlug, getEventTag, EVENTS } from "@/lib/events"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const EVENT_IMAGE_WIDTH = 800
const EVENT_IMAGE_HEIGHT = 500

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }))
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = getEventBySlug(slug)
  if (!event) notFound()
  const tag = getEventTag(event)

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/#events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            aria-label="Back to events list"
          >
            <ArrowLeft size={18} aria-hidden />
            <span className="text-sm uppercase tracking-wider">Back to Events</span>
          </Link>

          <div className="rounded-2xl overflow-hidden bg-card border border-border mb-10">
            <div className="aspect-[16/10] relative">
              <Image
                src={event.image}
                alt={event.title}
                width={EVENT_IMAGE_WIDTH}
                height={EVENT_IMAGE_HEIGHT}
                sizes="(max-width: 768px) 100vw, 672px"
                priority
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <span
                className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${tag.color} text-foreground`}
              >
                {tag.label}
              </span>
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

              {event.ticketLink && event.ticketLabel ? (
                <a
                  href={event.ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-4 btn-metallic-gold font-semibold uppercase tracking-wider rounded-full"
                >
                  <Ticket size={18} />
                  {event.ticketLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
