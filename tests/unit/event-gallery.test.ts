import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { getGalleryPhotosByDateISO } from "@/lib/data/gallery"
import { EVENTS } from "@/lib/events"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

/**
 * Event-page gallery contract: each event detail page shows the photos whose
 * `dateISO` matches the event (the standalone home gallery section is retired;
 * photos live with their event).
 */
describe("gallery photos by event date", () => {
  it("returns the boiler boat photos for 2026-04-04, all with matching dateISO", () => {
    const photos = getGalleryPhotosByDateISO("2026-04-04")
    expect(photos.length).toBeGreaterThan(0)
    for (const p of photos) {
      expect(p.dateISO).toBe("2026-04-04")
    }
  })

  it("returns an empty list for unknown or missing dates", () => {
    expect(getGalleryPhotosByDateISO("1999-01-01")).toEqual([])
    expect(getGalleryPhotosByDateISO(null)).toEqual([])
  })

  it("at least one event resolves to a non-empty photo set (event pages show galleries)", () => {
    const withPhotos = EVENTS.filter((e) => getGalleryPhotosByDateISO(e.dateISO).length > 0)
    expect(withPhotos.length).toBeGreaterThan(0)
  })

  it("the event detail page renders the per-event gallery grid under the description", () => {
    const eventPage = fs.readFileSync(path.join(rootDir, "app", "events", "[slug]", "page.tsx"), "utf8")
    expect(eventPage).toContain("getGalleryPhotosByDateISO")
    expect(eventPage).toContain("GalleryPhotoGrid")
    expect(eventPage).toContain("Event gallery")
  })
})
