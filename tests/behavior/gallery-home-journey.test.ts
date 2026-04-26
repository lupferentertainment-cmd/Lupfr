import { describe, expect, it } from "vitest"
import { GALLERY_CAROUSEL_PHOTOS } from "@/lib/data/gallery"
import {
  GALLERY_FROM_PARAM,
  galleryPhotoHref,
  galleryPhotoListBackHref,
  homeHistoryReplaceForGalleryBack,
} from "@/lib/gallery-nav"
import { getEscapeBackHref } from "@/lib/escape-back"

/**
 * **Website behavior (URL contract)** for: home carousel → photo page → “up” / Escape back.
 * Not tied to a specific component shape; if routes or query names change, update these and product copy together.
 */
describe("gallery: home carousel entry and return targets", () => {
  it("every home carousel item links to its photo with from=home so return goes to /#gallery", () => {
    expect(GALLERY_CAROUSEL_PHOTOS.length).toBeGreaterThan(0)
    expect(galleryPhotoListBackHref("home")).toBe("/#gallery")
    for (const p of GALLERY_CAROUSEL_PHOTOS) {
      const href = galleryPhotoHref(p.id, "home")
      expect(href).toBe(`/gallery/p/${p.id}?${GALLERY_FROM_PARAM}=home`)
      expect(
        getEscapeBackHref(`/gallery/p/${p.id}`, `?${GALLERY_FROM_PARAM}=home`)
      ).toBe("/#gallery")
    }
  })

  it("from gallery index keeps “up” on /gallery, not the home hash", () => {
    expect(galleryPhotoListBackHref("gallery")).toBe("/gallery")
    expect(
      getEscapeBackHref("/gallery/p/1", `?${GALLERY_FROM_PARAM}=gallery`)
    ).toBe("/gallery")
  })

  it("omitted or invalid from acts like the full gallery (not home hash)", () => {
    expect(galleryPhotoListBackHref(null)).toBe("/gallery")
    expect(galleryPhotoListBackHref(undefined)).toBe("/gallery")
    expect(getEscapeBackHref("/gallery/p/1", "")).toBe("/gallery")
  })

  it("home carousel click should rewrite history from / so browser Back lands on #gallery", () => {
    expect(homeHistoryReplaceForGalleryBack("/", "")).toBe("/#gallery")
    expect(homeHistoryReplaceForGalleryBack("/", "#events")).toBe("/#gallery")
    expect(homeHistoryReplaceForGalleryBack("/", "#gallery")).toBeNull()
    expect(homeHistoryReplaceForGalleryBack("/gallery", "")).toBeNull()
  })
})
