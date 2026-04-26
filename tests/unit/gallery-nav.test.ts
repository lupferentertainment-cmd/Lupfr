import { describe, expect, it } from "vitest"
import {
  GALLERY_FROM_PARAM,
  galleryCircularPreloadIndices,
  galleryLinearPreloadIndices,
  galleryPhotoHref,
  galleryPhotoListBackHref,
  homeHistoryReplaceForGalleryBack,
  isGalleryFrom,
} from "@/lib/gallery-nav"

describe("gallery-nav", () => {
  it("builds photo href without query by default", () => {
    expect(galleryPhotoHref(42)).toBe("/gallery/p/42")
  })

  it("preserves from=gallery and from=home for back links", () => {
    expect(galleryPhotoHref(7, "gallery")).toBe(`/gallery/p/7?${GALLERY_FROM_PARAM}=gallery`)
    expect(galleryPhotoHref(7, "home")).toBe(`/gallery/p/7?${GALLERY_FROM_PARAM}=home`)
  })

  it("galleryPhotoListBackHref maps from=home to /#gallery", () => {
    expect(galleryPhotoListBackHref("home")).toBe("/#gallery")
    expect(galleryPhotoListBackHref("gallery")).toBe("/gallery")
    expect(galleryPhotoListBackHref(null)).toBe("/gallery")
  })

  it("isGalleryFrom narrows known values", () => {
    expect(isGalleryFrom("gallery")).toBe(true)
    expect(isGalleryFrom("home")).toBe(true)
    expect(isGalleryFrom(null)).toBe(false)
    expect(isGalleryFrom("")).toBe(false)
    expect(isGalleryFrom("other")).toBe(false)
  })

  it("galleryCircularPreloadIndices warms ±radius with wrap, deduped", () => {
    expect(galleryCircularPreloadIndices(5, 0, 2).sort((a, b) => a - b)).toEqual([1, 2, 3, 4])
    expect(galleryCircularPreloadIndices(5, 2, 2).sort((a, b) => a - b)).toEqual([0, 1, 3, 4])
    expect(galleryCircularPreloadIndices(1, 0, 2)).toEqual([])
  })

  it("galleryLinearPreloadIndices warms within bounds, no wrap", () => {
    expect(galleryLinearPreloadIndices(5, 0, 2).sort((a, b) => a - b)).toEqual([1, 2])
    expect(galleryLinearPreloadIndices(5, 2, 2).sort((a, b) => a - b)).toEqual([0, 1, 3, 4])
    expect(galleryLinearPreloadIndices(5, 4, 2).sort((a, b) => a - b)).toEqual([2, 3])
    expect(galleryLinearPreloadIndices(5, -1, 2)).toEqual([])
    expect(galleryLinearPreloadIndices(5, 99, 2)).toEqual([])
  })

  it("homeHistoryReplaceForGalleryBack only adjusts root path when hash is not already #gallery", () => {
    expect(homeHistoryReplaceForGalleryBack("/", "")).toBe("/#gallery")
    expect(homeHistoryReplaceForGalleryBack("/", "#gallery")).toBeNull()
  })
})
