import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  GALLERY_ALBUM_FOLDER_DEFAULT_DATES,
  GALLERY_HOME_ALBUM_FOLDERS,
  GALLERY_PHOTOS,
  albumBreadcrumbForFolder,
} from "@/lib/data/gallery"
import {
  EVENTS,
  getUpcomingEvents,
} from "@/lib/events"

function publicFileExists(urlPath: string): boolean {
  const rel = urlPath.replace(/^\//, "")
  return existsSync(join(process.cwd(), "public", ...rel.split("/")))
}

describe("data integrity (gallery ↔ events, assets on disk)", () => {
  it("default gallery folder dates reference exactly one event; breadcrumb matches event title", () => {
    const datesChecked = new Set<string>()
    for (const [folder, dateISO] of Object.entries(GALLERY_ALBUM_FOLDER_DEFAULT_DATES)) {
      if (!datesChecked.has(dateISO)) {
        datesChecked.add(dateISO)
        const matches = EVENTS.filter((e) => e.dateISO === dateISO)
        expect(
          matches.length,
          `expected exactly one event on ${dateISO} (needed for folder→title mapping)`,
        ).toBe(1)
      }
      const event = EVENTS.find((e) => e.dateISO === dateISO)
      expect(event).toBeDefined()
      expect(albumBreadcrumbForFolder(folder)).toBe(event!.title)
    }
  })

  it("every gallery image path exists under public/", () => {
    for (const p of GALLERY_PHOTOS) {
      expect(publicFileExists(p.src), `missing file for gallery row ${p.id}: ${p.src}`).toBe(true)
    }
  })

  it("home album sections have photos and a matching public/gallery/ directory", () => {
    for (const folder of GALLERY_HOME_ALBUM_FOLDERS) {
      const n = GALLERY_PHOTOS.filter((p) => p.albumFolder === folder).length
      expect(n, `GALLERY_HOME_ALBUM_FOLDERS entry "${folder}" has no photos`).toBeGreaterThan(0)
      const dir = join(process.cwd(), "public", "gallery", folder)
      expect(existsSync(dir), `missing directory for home album: public/gallery/${folder}`).toBe(true)
    }
  })

  it("every upcoming event has ticketLink or explicit TBD status", () => {
    const upcoming = getUpcomingEvents()
    const missing = upcoming.filter(
      (e) => (typeof e.ticketLink !== "string" || e.ticketLink.trim().length === 0) && e.ticketStatus !== "tbd"
    )
    for (const e of missing) {
      console.warn(
        `[data-integrity] Upcoming event has no ticketLink or ticketStatus=tbd: slug="${e.slug}" title="${e.title}".`,
      )
    }
    expect(
      missing,
      missing.length === 0
        ? ""
        : `Missing ticketLink for upcoming event(s): ${missing.map((e) => e.slug).join(", ")}. Warnings logged above.`,
    ).toEqual([])
  })

  it("event hero image paths exist under public/", () => {
    for (const e of EVENTS) {
      if (!e.image.startsWith("/")) continue
      expect(
        publicFileExists(e.image),
        `missing event hero: ${e.title} → ${e.image}`,
      ).toBe(true)
    }
  })
})
