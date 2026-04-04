/**
 * Event data for LUPFR. Single source of truth for listing and detail pages.
 * Data from data/events.yml (build-time generated to lib/data/generated/events.json).
 * dateISO: YYYY-MM-DD for sorting/tag logic; null for date TBD.
 *
 * Upcoming vs past is derived statelessly from JSON + “today” in America/Los_Angeles
 * (event calendar dates are compared as strings to avoid UTC Date parsing shifts).
 */
import eventsJson from "@/lib/data/generated/events.json"

/** IANA zone for event calendar bucketing (Bay Area). */
export const LUPFR_EVENT_TIMEZONE = "America/Los_Angeles"

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

/** Today as YYYY-MM-DD in the event timezone (lexicographic compare works). */
export function todayDateISOInEventTZ(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LUPFR_EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** Upcoming: date TBD (dateISO null) or event calendar date >= today (event TZ). */
export function getUpcomingEvents(now: Date = new Date()): EventItem[] {
  const today = todayDateISOInEventTZ(now)
  return EVENTS_DATA.filter((e) => {
    if (e.dateISO === null) return true
    return e.dateISO >= today
  })
}

/** Past: event calendar date strictly before today (event TZ). TBD never counts as past. */
export function getPastEvents(now: Date = new Date()): EventItem[] {
  const today = todayDateISOInEventTZ(now)
  return EVENTS_DATA.filter((e) => {
    if (e.dateISO === null) return false
    return e.dateISO < today
  })
}

const UPCOMING_BADGE_CLASS =
  "bg-background/80 text-muted-foreground border border-border/70 backdrop-blur-sm shadow-sm dark:bg-background/70"

/** Same family as upcoming but emphasized — event is on the calendar day in LUPFR TZ. */
const TODAY_BADGE_CLASS =
  "bg-accent/30 text-accent border border-accent/50 backdrop-blur-sm shadow-sm"

const PAST_BADGE_CLASS =
  "bg-muted/90 text-muted-foreground border border-border/60 backdrop-blur-sm"

export type EventBadgeKind = "tbd" | "upcoming" | "today" | "past"

export function getEventTag(
  event: EventItem,
  now: Date = new Date()
): { label: string; color: string; kind: EventBadgeKind } {
  const today = todayDateISOInEventTZ(now)
  if (event.dateISO === null) {
    return {
      label: "Upcoming Event",
      color: UPCOMING_BADGE_CLASS,
      kind: "tbd",
    }
  }
  if (event.dateISO < today) {
    return { label: "Past Event", color: PAST_BADGE_CLASS, kind: "past" }
  }
  if (event.dateISO === today) {
    return {
      label: "Today's Event",
      color: TODAY_BADGE_CLASS,
      kind: "today",
    }
  }
  return {
    label: "Upcoming Event",
    color: UPCOMING_BADGE_CLASS,
    kind: "upcoming",
  }
}
