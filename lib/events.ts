/**
 * Event data for LUPFR. Single source of truth for listing and detail pages.
 * Data from data/events.yml (build-time generated to lib/data/generated/events.json).
 * dateISO: YYYY-MM-DD for sorting/tag logic; null for date TBD.
 *
 * Upcoming vs past is derived at render time from JSON + “today” in America/Los_Angeles
 * (dateISO compared as YYYY-MM-DD strings). Upcoming and Past lists are sorted by dateISO
 * (upcoming ascending with TBD last; past newest first).
 * Canonical hero URLs use `/events/...` (files under `public/events/`).
 */
import eventsJson from "@/lib/data/generated/events.json"

/** IANA zone for event calendar bucketing (Bay Area). */
export const LUPFR_EVENT_TIMEZONE = "America/Los_Angeles"

const EVENT_TZ_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: LUPFR_EVENT_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export interface EventItem {
  id: number
  slug: string
  title: string
  subtitle: string
  date: string
  dateISO: string | null
  time: string
  location: string
  image: string
  ticketLink?: string
  ticketLabel?: string
  description?: string
}

const EVENTS_DATA: EventItem[] = (eventsJson as EventItem[]).map((e) => ({
  ...e,
  image: String(e.image).startsWith("/") ? e.image : `/${e.image}`,
}))

export const EVENTS: EventItem[] = EVENTS_DATA

export function getEventBySlug(slug: string): EventItem | undefined {
  return EVENTS_DATA.find((e) => e.slug === slug)
}

/** Canonical path for an event detail page (`data/events.yml` → `/events/[slug]`). */
export function eventDetailPath(slug: string): string {
  return `/events/${slug}`
}

/**
 * Absolute hero image URL for Open Graph / Twitter cards.
 * `siteOrigin` should be the deployed origin (e.g. `SITE_URL`); relative YAML paths become absolute.
 */
export function eventHeroAbsoluteUrl(event: EventItem, siteOrigin: string): string {
  const image = String(event.image).trim()
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  const path = image.startsWith("/") ? image : `/${image}`
  const origin = siteOrigin.replace(/\/$/, "")
  return `${origin}${path}`
}

/** Pre-composed share line from YAML `title` + optional `subtitle` (native share, X intent text). */
export function eventShareTitle(event: EventItem): string {
  const parts: string[] = [event.title]
  const sub = event.subtitle?.trim()
  if (sub) parts.push(sub)
  return `LUPFR — ${parts.join(" — ")}`
}

/** Today as YYYY-MM-DD in the event timezone (lexicographic compare works). */
export function todayDateISOInEventTZ(now: Date = new Date()): string {
  return EVENT_TZ_DATE_FORMATTER.format(now)
}

function compareByDateISOThenId(a: EventItem, b: EventItem): number {
  const aD = a.dateISO
  const bD = b.dateISO
  if (aD === null && bD === null) return a.id - b.id
  if (aD === null) return 1
  if (bD === null) return -1
  const c = aD.localeCompare(bD)
  return c !== 0 ? c : a.id - b.id
}

/** Upcoming: date TBD (dateISO null) or event calendar date >= today (event TZ). Sorted by dateISO ascending; TBD last. */
export function getUpcomingEvents(now: Date = new Date()): EventItem[] {
  const today = todayDateISOInEventTZ(now)
  const list = EVENTS_DATA.filter((e) => {
    if (e.dateISO === null) return true
    return e.dateISO >= today
  })
  return [...list].sort(compareByDateISOThenId)
}

/** Past: event calendar date strictly before today (event TZ). TBD never counts as past. Newest past date first. */
export function getPastEvents(now: Date = new Date()): EventItem[] {
  const today = todayDateISOInEventTZ(now)
  const list = EVENTS_DATA.filter((e) => {
    if (e.dateISO === null) return false
    return e.dateISO < today
  })
  return [...list].sort((a, b) => {
    const c = b.dateISO!.localeCompare(a.dateISO!)
    return c !== 0 ? c : b.id - a.id
  })
}

/**
 * Pill shell for gold badges; label is rendered with `GoldShineText` + `textClass` (typography only;
 * metallic fill and scroll shine come from that component — same as section titles).
 */
const EVENT_BADGE_PILL_GOLD =
  "px-4 py-1.5 text-sm font-semibold tracking-tight rounded-full border border-gold-accent/40 bg-background/90 backdrop-blur-sm shadow-sm dark:bg-background/80"

/** Shared label element: real heading for a11y; `text-inherit` follows pill (`text-sm` vs overrides like `text-xs`). */
const EVENT_BADGE_LABEL_BASE =
  "m-0 text-inherit font-semibold tracking-tight inline-block overflow-visible gpu-accelerate"

const EVENT_BADGE_TEXT_GOLD_METALLIC = EVENT_BADGE_LABEL_BASE

/** Today: accent pill; text stays legible (no metallic clip on accent fill). */
const EVENT_BADGE_PILL_TODAY =
  "px-4 py-1.5 text-sm font-semibold tracking-tight rounded-full bg-accent/30 border border-accent/50 backdrop-blur-sm shadow-sm"

const EVENT_BADGE_TEXT_TODAY = `text-accent ${EVENT_BADGE_LABEL_BASE}`

export type EventBadgeKind = "tbd" | "upcoming" | "today" | "past"

export function getEventTag(
  event: EventItem,
  now: Date = new Date()
): { label: string; kind: EventBadgeKind; pillClass: string; textClass: string } {
  const today = todayDateISOInEventTZ(now)
  if (event.dateISO === null) {
    return {
      label: "Upcoming Event",
      kind: "tbd",
      pillClass: EVENT_BADGE_PILL_GOLD,
      textClass: EVENT_BADGE_TEXT_GOLD_METALLIC,
    }
  }
  if (event.dateISO < today) {
    return {
      label: "Past Event",
      kind: "past",
      pillClass: EVENT_BADGE_PILL_GOLD,
      textClass: EVENT_BADGE_TEXT_GOLD_METALLIC,
    }
  }
  if (event.dateISO === today) {
    return {
      label: "Today's Event",
      kind: "today",
      pillClass: EVENT_BADGE_PILL_TODAY,
      textClass: EVENT_BADGE_TEXT_TODAY,
    }
  }
  return {
    label: "Upcoming Event",
    kind: "upcoming",
    pillClass: EVENT_BADGE_PILL_GOLD,
    textClass: EVENT_BADGE_TEXT_GOLD_METALLIC,
  }
}
