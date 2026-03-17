/**
 * Event data for LUPFR. Single source of truth for listing and detail pages.
 * dateISO: YYYY-MM-DD for sorting/tag logic; "TBD" for date TBD.
 * Order: upcoming events first, then past events (past order: Shamrock & House → Boiler Boat 002 → Haunted at Brixton).
 */

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

export const EVENTS: EventItem[] = [
  // —— Upcoming (in display order) ——
  {
    id: 5,
    slug: "wheres-west-corbin-mason",
    title: "Where's West",
    subtitle: "Corbin Mason",
    date: "TBD",
    dateISO: null,
    time: "TBD",
    location: "TBD",
    image: "/events/wheres_west.jpeg",
    description: "Where's West with Corbin Mason.",
  },
  {
    id: 1,
    slug: "boiler-boat-003-wheres-west-warehouse-session",
    title: "BOILER BOAT 003 – WHERES WEST — WAREHOUSE SESSION",
    subtitle: "",
    date: "TBD",
    dateISO: null,
    time: "TBD",
    location: "TBD",
    image: "/events/boiler_boat.png",
    description: "Boiler Boat meets Where's West in a warehouse session.",
  },
  // —— Past (order: Shamrock & House → Boiler Boat 002 → Haunted at Brixton) ——
  {
    id: 2,
    slug: "shamrock-house",
    title: "Shamrock & House",
    subtitle: "",
    date: "March 14th, 2025",
    dateISO: "2025-03-14",
    time: "9 PM - 1 AM",
    location: "Brixton Bar, Marina District",
    image: "/events/shamrock_house.jpeg",
    description: "St. Patrick's season house music at Brixton Bar.",
  },
  {
    id: 3,
    slug: "boiler-boat-002-apres-ski-edition",
    title: "Boiler Boat 002",
    subtitle: "Apres Ski Edition feat. Rayne",
    date: "Jan 31st, 2025",
    dateISO: "2025-01-31",
    time: "2-4 PM",
    location: "Fisherman's Wharf",
    image: "/past_events/boiler_boat_002_apres_ski_edition.jpg",
    description: "Boiler Boat brings apres to the bay.",
  },
  {
    id: 4,
    slug: "haunted-at-brixton",
    title: "Haunted at Brixton",
    subtitle: "Halloween Bash",
    date: "Nov 1, 2024",
    dateISO: "2024-11-01",
    time: "9 PM - 1 AM",
    location: "Brixton Bar, Marina District",
    image: "/past_events/haunted_at_brixton.jpg",
    description: "Spooky house tunes and extreme dancing.",
  },
]

export function getEventBySlug(slug: string): EventItem | undefined {
  return EVENTS.find((e) => e.slug === slug)
}

/** Upcoming: date TBD (dateISO null) or event date >= today. */
export function getUpcomingEvents(): EventItem[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return EVENTS.filter((e) => {
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
  return EVENTS.filter((e) => {
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
