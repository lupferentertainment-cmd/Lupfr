/**
 * Event data for LUPFR. Single source of truth for listing and detail pages.
 * dateISO: YYYY-MM-DD for sorting/tag logic; "TBD" for date TBD.
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
  {
    id: 1,
    slug: "boiler-boat-003-yacht-edition",
    title: "Boiler Boat 003",
    subtitle: "Yacht Edition feat. HLWA",
    date: "April 4th, 2026",
    dateISO: "2026-04-04",
    time: "3-6 PM",
    location: "Pier 40, SF",
    image: "/events/boiler_boat.png",
    ticketLink: "https://www.eventbrite.com/e/boiler-boat-003-yacht-edition-feat-hlwa-soch-tickets-1981381998896?aff=oddtdtcreator",
    ticketLabel: "Tickets",
    description: "Boiler Boat returns with a yacht edition on the Bay featuring HLWA.",
  },
  {
    id: 2,
    slug: "shamrock-house",
    title: "Shamrock & House",
    subtitle: "",
    date: "March 14th, 2026",
    dateISO: "2026-03-14",
    time: "9 PM - 1 AM",
    location: "Brixton Bar, Marina District",
    image: "/events/shamrock_house.jpeg",
    ticketLink: "https://www.eventbrite.com/e/shamrock-house-at-brixton-bar-tickets-1982327604227?aff=oddtdtcreator",
    ticketLabel: "Tickets",
    description: "St. Patrick's season house music at Brixton Bar.",
  },
  {
    id: 3,
    slug: "wheres-west-corbin-mason",
    title: "Where's West?",
    subtitle: "feat. Corbin Mason",
    date: "April 18th, 2026",
    dateISO: "2026-04-18",
    time: "11 AM - 2 PM",
    location: "Eria Events, Sausalito",
    image: "/events/wheres_west.jpeg",
    ticketLink: "https://www.eriaevents.co/product/events/wheres-west-waterfront-day-party-in-sausalito",
    ticketLabel: "Tickets",
    description: "Waterfront day party in Sausalito with Corbin Mason.",
  },
  {
    id: 4,
    slug: "warehouse-sessions",
    title: "Warehouse Sessions",
    subtitle: "",
    date: "TBD",
    dateISO: null,
    time: "10 PM - 2 AM",
    location: "Secret Location",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    description: "Underground warehouse series. Location revealed to ticket holders.",
  },
]

export function getEventBySlug(slug: string): EventItem | undefined {
  return EVENTS.find((e) => e.slug === slug)
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
