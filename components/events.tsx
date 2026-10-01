"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useRef } from "react"

import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { eventDetailPath, getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events"

function featuredExperiences(): EventItem[] {
  const upcoming = getUpcomingEvents()
  if (upcoming.length >= 4) return upcoming.slice(0, 4)
  return [...upcoming, ...getPastEvents()].slice(0, 4)
}

export function Events() {
  const ref = useRef<HTMLElement>(null)
  const events = useMemo(() => featuredExperiences(), [])

  return (
    <section
      id="events"
      ref={ref}
      className="border-b border-border px-4 py-24 sm:px-6 lg:px-12 lg:py-[120px]"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Our Work</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(44px,5vw,68px)] font-extrabold uppercase leading-[0.92] tracking-[-0.025em]">
              <GoldShineText scrollTargetRef={ref}>Featured Experiences</GoldShineText>
            </h2>
          </div>
          <Link href="/events" className="w-fit border-b border-accent pb-1 text-sm font-medium text-accent">
            View Past Events →
          </Link>
        </div>

        <div className="flex flex-col gap-20 lg:gap-24">
          {events.map((event, i) => (
            <article
              key={event.id}
              className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:gap-12"
            >
              <Link
                href={eventDetailPath(event.slug)}
                className={`relative block aspect-[16/10] overflow-hidden rounded-sm border border-border bg-card ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover object-center transition-transform duration-700 hover:scale-[1.025]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                <span className="absolute bottom-4 left-4 border border-white/20 bg-black/55 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/90">
                  {event.city || event.location}
                </span>
              </Link>

              <div className={`flex max-w-[560px] flex-col gap-5 lg:pt-2 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.17em] text-accent">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px w-10 bg-accent/60" />
                  <span>{event.brandTag || "LUPFR"}</span>
                </div>

                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(36px,4vw,56px)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-foreground">
                  {event.title}
                </h3>

                {event.subtitle ? (
                  <p className="text-[16px] leading-[1.65] text-muted-foreground">{event.subtitle}</p>
                ) : null}

                <div className="grid grid-cols-2 gap-x-8 border-t border-border pt-4 text-sm">
                  <div>
                    <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-accent">Date</div>
                    <div className="text-foreground">{event.date}</div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-accent">Location</div>
                    <div className="text-foreground">{event.location}</div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-3">
                  <Link
                    href={eventDetailPath(event.slug)}
                    className="inline-flex items-center gap-2 border border-accent/55 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    View Experience <span>→</span>
                  </Link>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-2 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-accent"
                  >
                    Create Something Like This →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
