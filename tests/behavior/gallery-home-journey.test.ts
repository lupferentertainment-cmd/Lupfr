import { describe, expect, it } from "vitest"
import { getGalleryPhotosByDateISO } from "@/lib/data/gallery"
import {
  GALLERY_FROM_PARAM,
  galleryPhotoHref,
  galleryPhotoListBackHref,
} from "@/lib/gallery-nav"
import { getEscapeBackHref } from "@/lib/escape-back"
import { EVENTS } from "@/lib/events"

/**
 * **Website behavior (URL contract)** for the event-page gallery journey:
 * event detail grid → photo page → “up” / Escape back. The standalone home
 * `#gallery` carousel is retired; photos are reached from their event page and
 * return to the full `/gallery` index (shared photo URLs stay alive).
 * Not tied to a specific component shape; if routes or query names change,
 * update these and product copy together.
 */
describe("gallery: event page entry and return targets", () => {
  it("every event-page photo links to its photo page with from=gallery", () => {
    const photos = EVENTS.flatMap((e) => getGalleryPhotosByDateISO(e.dateISO))
    expect(photos.length).toBeGreaterThan(0)
    for (const p of photos) {
      const href = galleryPhotoHref(p.id, "gallery")
      expect(href).toBe(`/gallery/p/${p.id}?${GALLERY_FROM_PARAM}=gallery`)
      expect(
        getEscapeBackHref(`/gallery/p/${p.id}`, `?${GALLERY_FROM_PARAM}=gallery`)
      ).toBe("/gallery")
    }
  })

  it("from gallery index keeps “up” on /gallery", () => {
    expect(galleryPhotoListBackHref("gallery")).toBe("/gallery")
    expect(
      getEscapeBackHref("/gallery/p/1", `?${GALLERY_FROM_PARAM}=gallery`)
    ).toBe("/gallery")
  })

  it("omitted or invalid from acts like the full gallery", () => {
    expect(galleryPhotoListBackHref(null)).toBe("/gallery")
    expect(galleryPhotoListBackHref(undefined)).toBe("/gallery")
    expect(getEscapeBackHref("/gallery/p/1", "")).toBe("/gallery")
  })
})
