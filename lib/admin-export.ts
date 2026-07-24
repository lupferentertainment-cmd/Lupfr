import { ARTISTS } from "@/lib/data/artists"
import { getBrands } from "@/lib/data/brands"
import { getPartners } from "@/lib/data/partners"
import { getServices } from "@/lib/data/services"
import { EVENTS, getPastEvents, getUpcomingEvents } from "@/lib/events"

export const ADMIN_EXPORT_RESOURCES = [
  "events",
  "artists",
  "services",
  "brands",
  "partners",
] as const

export type AdminExportResource = (typeof ADMIN_EXPORT_RESOURCES)[number]

export function isAdminExportResource(value: string): value is AdminExportResource {
  return (ADMIN_EXPORT_RESOURCES as readonly string[]).includes(value)
}

type CsvRow = Record<string, string | number | boolean | null | undefined>

export function rowsToCsv(headers: string[], rows: CsvRow[]): string {
  const escape = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(","))
  }
  return `${lines.join("\n")}\n`
}

function stampFilename(resource: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return `lupfr-${resource}-${day}.csv`
}

export function buildAdminExport(resource: AdminExportResource): {
  filename: string
  csv: string
  rowCount: number
} {
  switch (resource) {
    case "events": {
      const upcomingSlugs = new Set(getUpcomingEvents().map((e) => e.slug))
      const pastSlugs = new Set(getPastEvents().map((e) => e.slug))
      const headers = [
        "slug",
        "title",
        "dateISO",
        "status",
        "location",
        "brandTag",
        "ticketLink",
        "partifulLink",
      ]
      const rows = EVENTS.map((event) => ({
        slug: event.slug,
        title: event.title,
        dateISO: event.dateISO ?? "",
        status: upcomingSlugs.has(event.slug)
          ? "upcoming"
          : pastSlugs.has(event.slug)
            ? "past"
            : "unknown",
        location: event.location,
        brandTag: event.brandTag ?? "",
        ticketLink: event.ticketLink ?? "",
        partifulLink: event.partifulLink ?? "",
      }))
      return { filename: stampFilename("events"), csv: rowsToCsv(headers, rows), rowCount: rows.length }
    }
    case "artists": {
      const headers = ["name", "genre", "instagram", "spotify", "soundcloud", "youtube"]
      const rows = ARTISTS.map((artist) => ({
        name: artist.name,
        genre: artist.genre,
        instagram: artist.instagram,
        spotify: artist.spotify ?? "",
        soundcloud: artist.soundcloud ?? "",
        youtube: artist.youtube ?? "",
      }))
      return { filename: stampFilename("artists"), csv: rowsToCsv(headers, rows), rowCount: rows.length }
    }
    case "services": {
      const headers = ["title", "description", "features"]
      const rows = getServices().map((service) => ({
        title: service.title,
        description: service.description,
        features: service.features.join(" | "),
      }))
      return { filename: stampFilename("services"), csv: rowsToCsv(headers, rows), rowCount: rows.length }
    }
    case "brands": {
      const headers = ["key", "title", "tag", "format", "comingSoon", "externalUrl"]
      const rows = getBrands().map((brand) => ({
        key: brand.key,
        title: brand.title,
        tag: brand.tag,
        format: brand.format,
        comingSoon: Boolean(brand.comingSoon),
        externalUrl: brand.externalUrl ?? "",
      }))
      return { filename: stampFilename("brands"), csv: rowsToCsv(headers, rows), rowCount: rows.length }
    }
    case "partners": {
      const headers = ["name", "url", "logoTreatment"]
      const rows = getPartners().map((partner) => ({
        name: partner.name,
        url: partner.url ?? "",
        logoTreatment: partner.logoTreatment ?? "",
      }))
      return { filename: stampFilename("partners"), csv: rowsToCsv(headers, rows), rowCount: rows.length }
    }
    default: {
      const _exhaustive: never = resource
      throw new Error(`Unknown admin export resource: ${_exhaustive}`)
    }
  }
}

export function artistGenreBreakdown(): { genre: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const artist of ARTISTS) {
    const genre = artist.genre?.trim() || "Unspecified"
    counts.set(genre, (counts.get(genre) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
}

export function eventStatusBreakdown(): { name: string; count: number }[] {
  return [
    { name: "Upcoming", count: getUpcomingEvents().length },
    { name: "Past", count: getPastEvents().length },
  ]
}

/** Optional browser URL for the contacts / phone-list Google Sheet (SoR). */
export function getAdminContactsSheetUrl(): string | null {
  const value = process.env.ADMIN_CONTACTS_SHEET_URL?.trim()
  return value || null
}
