"use client"

import Image from "next/image"
import Link from "next/link"
import { useEventCalendarClock } from "@/hooks/use-event-calendar-clock"
import { eventDetailPath, getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events"

function Experience({ event, reverse = false }: { event: EventItem; reverse?: boolean }) {
  return (
    <article className={`grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-stretch ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <Link href={eventDetailPath(event.slug)} className="group relative min-h-[420px] overflow-hidden bg-[#141210]">
        {event.image ? <Image src={event.image} alt={event.title} fill sizes="(min-width:1024px) 70vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
      </Link>
      <div className="flex flex-col justify-between border-t border-[#c9a869]/40 py-4 lg:py-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9a869]">Featured Experience</p>
          <h3 className="mt-5 font-condensed text-[clamp(38px,5vw,72px)] font-extrabold uppercase leading-[0.9] text-[#f3efe6]">{event.title}</h3>
          {event.subtitle ? <p className="mt-5 text-base leading-relaxed text-[#bdb6a9]">{event.subtitle}</p> : null}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8f887c]">
          <span>{event.city || "LUPFR"}</span><Link href={eventDetailPath(event.slug)} className="text-[#e8caa0]">View experience →</Link>
        </div>
      </div>
    </article>
  )
}

export function ClaudeHomeExperiences() {
  const now = useEventCalendarClock()
  const all = [...getUpcomingEvents(now), ...getPastEvents(now)]
  const seen = new Set<string>()
  const featured = all.filter((e) => (seen.has(e.slug) ? false : (seen.add(e.slug), true))).slice(0, 3)
  if (!featured.length) return null

  return (
    <section id="events" className="border-b border-white/10 bg-[#0b0a08] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Our Work</p><h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Featured Experiences</h2></div>
          <Link href="/events" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">View all experiences →</Link>
        </div>
        <div className="space-y-20 lg:space-y-28">
          {featured.map((event, i) => <Experience key={event.slug} event={event} reverse={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  )
}
