import type { EventItem } from "@/lib/events"

export interface PartifulMeta {
  image: string
  description: string
  title: string
}

export interface ResolvedTicket {
  link: string
  label: string
}

const PARTIFUL_FETCH_TIMEOUT_MS = 1200

function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LUPFR/1.0; +https://lupfr.com)" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(PARTIFUL_FETCH_TIMEOUT_MS),
  })
}

function parseOgTag(html: string, property: string): string {
  const rePropFirst = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*?)["']`,
    "i"
  )
  const reContentFirst = new RegExp(
    `<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${property}["']`,
    "i"
  )
  return (html.match(rePropFirst) ?? html.match(reContentFirst))?.[1]?.trim() ?? ""
}

export async function fetchPartifulMeta(partifulLink: string): Promise<PartifulMeta> {
  const res = await fetchWithTimeout(partifulLink)
  if (!res.ok) {
    throw new Error(`Partiful fetch failed: ${res.status} ${res.statusText} — ${partifulLink}`)
  }
  const html = await res.text()
  return {
    image: parseOgTag(html, "og:image"),
    description: parseOgTag(html, "og:description"),
    title: parseOgTag(html, "og:title"),
  }
}

export function resolveEventImage(event: EventItem, meta: PartifulMeta | null): string {
  if (event.partifulLink && meta?.image) return meta.image
  return event.image ?? ""
}

export function resolveEventDescription(
  event: EventItem,
  meta: PartifulMeta | null
): string | undefined {
  if (event.partifulLink && meta?.description) return meta.description
  return event.description
}

export function resolveEventTicket(event: EventItem): ResolvedTicket | "tbd" | null {
  if (event.ticketStatus === "tbd") return "tbd"
  if (event.partifulLink) {
    return { link: event.partifulLink, label: event.ticketLabel?.trim() || "RSVP on Partiful" }
  }
  if (event.ticketLink) {
    return { link: event.ticketLink, label: event.ticketLabel?.trim() || "Tickets" }
  }
  return null
}
