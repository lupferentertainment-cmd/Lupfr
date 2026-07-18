"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { m } from "framer-motion"
import { CalendarDays, History, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { ShimmerImage } from "@/components/shimmer-image"
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

const STATUS_FILTERS: { value: StatusFilter; label: string; icon?: typeof CalendarDays }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming", icon: CalendarDays },
  { value: "past", label: "Past", icon: History },
]

const cardRevealEase = [0.22, 1, 0.36, 1] as const

/** Staggered rise-in for directory cards (opacity + transform only, once). */
function CardReveal({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <m.div
      className="h-full gpu-accelerate"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.06, ease: cardRevealEase }}
    >
      {children}
    </m.div>
  )
}

function matchesBrand(event: EventItem, brandFilter: string): boolean {
  return brandFilter === "all" || event.brandTag === brandFilter
}

function EventPosterMedia({ event, pill, city }: { event: EventItem; pill: string; city?: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-muted">
      {event.image ? (
        <div className="h-full w-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.04]">
          <ShimmerImage
            src={event.image}
            alt={event.title}
            width={EVENT_IMAGE_WIDTH}
            height={EVENT_IMAGE_HEIGHT}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </div>
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
        <span className="absolute right-[14px] top-[14px] inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#0b0a08]/75 px-[10px] py-[6px] font-mono text-[10px] uppercase tracking-[0.08em] text-gold-accent backdrop-blur-sm">
          <MapPin size={10} className="shrink-0" aria-hidden />
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
      className="event-card-depth event-card-depth--lift group relative block h-full overflow-hidden rounded-sm border border-border bg-card hover:border-accent/50"
      aria-label={`View event: ${event.title}`}
    >
      <EventPosterMedia event={event} pill={upcomingPillLabel(event, todayISO)} city={event.city} />
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <EventBrandTag event={event} />
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            <CalendarDays size={11} className="shrink-0 text-accent" aria-hidden />
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
      className="event-card-depth event-card-depth--lift group relative block h-full overflow-hidden rounded-sm border border-border bg-card opacity-85 transition-opacity duration-200 ease-out hover:border-accent/50 hover:opacity-100"
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
        {STATUS_FILTERS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={statusFilter === value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
              statusFilter === value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-secondary text-foreground hover:border-accent"
            )}
          >
            {Icon ? <Icon size={14} className="shrink-0" aria-hidden /> : null}
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
              {upcoming.map((event, index) => (
                <CardReveal key={event.id} index={index}>
                  <UpcomingEventCard event={event} todayISO={todayISO} />
                </CardReveal>
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
              {past.map((event, index) => (
                <CardReveal key={event.id} index={index}>
                  <PastEventCard event={event} todayISO={todayISO} />
                </CardReveal>
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
