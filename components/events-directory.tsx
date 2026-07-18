"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BrandSlashText } from "@/components/brand-slash-text"
import { getBrands } from "@/lib/data/brands"
import {
  EVENTS,
  type EventItem,
  eventDetailPath,
  getPastEvents,
  getUpcomingEvents,
  todayDateISOInEventTZ,
} from "@/lib/events"

const EVENT_IMAGE_WIDTH = 600
const EVENT_IMAGE_HEIGHT = 600

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

/** "2026-07-24" -> "Jul 24" (deterministic, no locale/timezone drift). */
function shortDate(dateISO: string | null): string {
  if (!dateISO) return "TBD"
  const [, month, day] = dateISO.split("-").map(Number)
  return `${MONTH_NAMES[(month ?? 1) - 1]} ${day}`
}

/** Whole days between today (event TZ) and dateISO; positive = future. */
function daysFromToday(dateISO: string, todayISO: string): number {
  return Math.round(
    (new Date(`${dateISO}T00:00:00`).getTime() - new Date(`${todayISO}T00:00:00`).getTime()) / 86_400_000
  )
}

function upcomingPillLabel(event: EventItem, todayISO: string): string {
  if (event.dateISO === null) return "DATE TBD"
  const days = daysFromToday(event.dateISO, todayISO)
  if (days === 0) return "TODAY"
  if (days === 1) return "TOMORROW"
  return `IN ${days} DAYS`
}

const brandAccentByTitle = new Map(getBrands().map((brand) => [brand.title, brand.accent]))

/** Comp brand-filter order (All Brands + the five wordmarks). */
const BRAND_FILTERS = ["all", ...getBrands().map((brand) => brand.title)] as const

type StatusFilter = "all" | "upcoming" | "past"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
]

function matchesBrand(event: EventItem, brandFilter: string): boolean {
  return brandFilter === "all" || event.brandTag === brandFilter
}

function EventPosterMedia({ event, pill, city }: { event: EventItem; pill: string; city?: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-muted">
      {event.image ? (
        <Image
          src={event.image}
          alt={event.title}
          width={EVENT_IMAGE_WIDTH}
          height={EVENT_IMAGE_HEIGHT}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        // Comp's striped COMING SOON tile for events without a poster yet.
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, var(--muted) 0, var(--muted) 10px, var(--card) 10px, var(--card) 20px)",
          }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-foreground/40">
            Coming soon
          </span>
        </div>
      )}
      <span
        suppressHydrationWarning
        className="absolute left-[14px] top-[14px] rounded-full border border-white/15 bg-[#0b0a08]/75 px-[10px] py-[6px] font-mono text-[10px] uppercase tracking-[0.08em] text-[#f3efe6] backdrop-blur-sm"
      >
        {pill}
      </span>
      {city ? (
        <span className="absolute right-[14px] top-[14px] rounded-full border border-white/15 bg-[#0b0a08]/75 px-[10px] py-[6px] font-mono text-[10px] uppercase tracking-[0.08em] text-gold-accent backdrop-blur-sm">
          {city}
        </span>
      ) : null}
    </div>
  )
}

function EventBrandTag({ event }: { event: EventItem }) {
  const accent = event.brandTag ? brandAccentByTitle.get(event.brandTag) : undefined
  return (
    <span
      className={cn("font-mono text-[10px] uppercase tracking-[0.1em]", accent ? undefined : "text-accent")}
      style={accent ? { color: accent } : undefined}
    >
      {event.brandTag ? <BrandSlashText text={event.brandTag} color={accent} /> : "LUPFR"}
    </span>
  )
}

function UpcomingEventCard({ event, todayISO }: { event: EventItem; todayISO: string }) {
  return (
    <Link
      href={eventDetailPath(event.slug)}
      className="group overflow-hidden rounded-sm border border-border bg-card transition-[border-color] duration-150 ease-out hover:border-accent/50"
      aria-label={`View event: ${event.title}`}
    >
      <EventPosterMedia event={event} pill={upcomingPillLabel(event, todayISO)} city={event.city} />
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <EventBrandTag event={event} />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            {shortDate(event.dateISO)}
          </span>
        </div>
        <h3 className="mb-2 font-condensed text-2xl font-extrabold uppercase leading-tight tracking-normal text-foreground">
          <BrandSlashText text={event.title} />
        </h3>
        <p className="m-0 text-[13px] text-gold-accent">{event.subtitle}</p>
      </div>
    </Link>
  )
}

function PastEventCard({ event, todayISO }: { event: EventItem; todayISO: string }) {
  const daysAgo = event.dateISO ? -daysFromToday(event.dateISO, todayISO) : null
  return (
    <Link
      href={eventDetailPath(event.slug)}
      className="group overflow-hidden rounded-sm border border-border bg-card opacity-85 transition-[border-color,opacity] duration-150 ease-out hover:border-accent/50 hover:opacity-100"
      aria-label={`View past event: ${event.title}`}
    >
      <EventPosterMedia event={event} pill={daysAgo === null ? "PAST" : `${daysAgo} DAYS AGO`} />
      <div className="p-5">
        <div className="mb-2">
          <EventBrandTag event={event} />
        </div>
        <h3 className="mb-1.5 font-condensed text-2xl font-extrabold uppercase leading-tight tracking-normal text-foreground">
          <BrandSlashText text={event.title} />
        </h3>
        <p className="m-0 text-[13px] text-muted-foreground">{event.subtitle}</p>
      </div>
    </Link>
  )
}

export function EventsDirectory() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const todayISO = todayDateISOInEventTZ()

  const upcoming = useMemo(() => getUpcomingEvents().filter((e) => matchesBrand(e, brandFilter)), [brandFilter])
  const past = useMemo(() => getPastEvents().filter((e) => matchesBrand(e, brandFilter)), [brandFilter])

  const showUpcoming = statusFilter !== "past"
  const showPast = statusFilter !== "upcoming"

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={statusFilter === value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
              statusFilter === value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-secondary text-foreground hover:border-accent"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {BRAND_FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={brandFilter === value}
            onClick={() => setBrandFilter(value)}
            className={cn(
              "min-h-9 rounded-full border px-3.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors",
              brandFilter === value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-secondary text-foreground hover:border-accent"
            )}
          >
            {value === "all" ? "All Brands" : <BrandSlashText text={value} />}
          </button>
        ))}
      </div>

      {showUpcoming ? (
        <section className="mb-14" aria-label="Upcoming events">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Upcoming</p>
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <UpcomingEventCard key={event.id} event={event} todayISO={todayISO} />
              ))}
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">No upcoming events match this filter.</p>
          )}
        </section>
      ) : null}

      {showPast ? (
        <section aria-label="Past events">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Past</p>
          {past.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <PastEventCard key={event.id} event={event} todayISO={todayISO} />
              ))}
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">No past events match this filter.</p>
          )}
        </section>
      ) : null}
    </div>
  )
}

/** Exported for tests: total events must equal upcoming + past partition of EVENTS. */
export const EVENTS_DIRECTORY_SOURCE_COUNT = EVENTS.length
