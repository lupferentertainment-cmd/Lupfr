import { describe, expect, it } from "vitest"
import {
  formatGalleryDateLabel,
  galleryPhotoDateLabel,
  groupGalleryByDateISO,
  isValidGalleryDateISO,
} from "@/lib/gallery-date"
import type { GalleryPhoto } from "@/lib/data/gallery"

describe("gallery-date", () => {
  it("validates YYYY-MM-DD", () => {
    expect(isValidGalleryDateISO("2026-04-04")).toBe(true)
    expect(isValidGalleryDateISO("2026-13-01")).toBe(false)
    expect(isValidGalleryDateISO("2026-4-4")).toBe(false)
  })

  it("formats like Apple Photos (short month, numeric day, year)", () => {
    expect(formatGalleryDateLabel("2026-04-04")).toBe("Apr 4, 2026")
    expect(formatGalleryDateLabel("2026-12-12")).toBe("Dec 12, 2026")
  })

  it("galleryPhotoDateLabel handles null and invalid dateISO", () => {
    expect(galleryPhotoDateLabel(null)).toBeNull()
    expect(galleryPhotoDateLabel("2026-13-40")).toBeNull()
  })

  it("groups by date with newest first and undated last", () => {
    const a = { dateISO: "2026-04-04" } as Pick<GalleryPhoto, "dateISO">
    const b = { dateISO: "2026-04-18" } as Pick<GalleryPhoto, "dateISO">
    const u = { dateISO: null } as Pick<GalleryPhoto, "dateISO">
    const groups = groupGalleryByDateISO([a, u, b])
    expect(groups.map((g) => g.sortKey)).toEqual(["2026-04-18", "2026-04-04", "__undated__"])
    expect(groups[0].heading).toBe("Apr 18, 2026")
  })
})
