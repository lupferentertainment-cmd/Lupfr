/**
 * Event data for LUPFR. Single source of truth for listing and detail pages.
 * Data from data/events.yml (build-time generated to lib/data/generated/events.json).
 * dateISO: YYYY-MM-DD for sorting/tag logic; null for date TBD.
 */
import eventsJson from "@/lib/data/generated/events.json"

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

/** Upcoming: date TBD (dateISO null) or event date >= today. */
export function getUpcomingEvents(): EventItem[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return EVENTS_DATA.filter((e) => {
    if (e.dateISO === null) return true
    const d = new Date(e.dateISO)
    d.setHours(0, 0, 0, 0)
    return d >= today
  })
}

/** Past: event date < today. */
export function getPastEvents(): EventItem[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return EVENTS_DATA.filter((e) => {
    if (e.dateISO === null) return false
    const d = new Date(e.dateISO)
    d.setHours(0, 0, 0, 0)
    return d < today
  })
}

export function getEventTag(event: EventItem): { label: string; color: string } {
  if (event.dateISO === null) return { label: "Upcoming Event", color: "bg-accent/20 text-accent-foreground" }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(event.dateISO)
  eventDate.setHours(0, 0, 0, 0)
  if (eventDate >= today) return { label: "Upcoming Event", color: "bg-accent/20 text-accent-foreground" }
  return { label: "Past Event", color: "bg-muted" }
}
