/**
 * Branch coverage for the data-layer normalization helpers whose fallback
 * paths never fire against the checked-in YAML (all committed image paths
 * already start with "/", no partner ships an imageDark variant, and the
 * generated services all use valid icons/brand keys). Each case mocks the
 * generated JSON module and re-imports the data module fresh.
 */
import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.doUnmock("@/lib/data/generated/partners.json")
  vi.doUnmock("@/lib/data/generated/artists.json")
  vi.doUnmock("@/lib/data/generated/press.json")
  vi.doUnmock("@/lib/data/generated/services.json")
  vi.doUnmock("@/lib/data/generated/gallery.json")
  vi.doUnmock("@/lib/data/generated/brands.json")
  vi.resetModules()
})

describe("data-layer normalization fallback branches", () => {
  it("partners: adds the leading slash to image and imageDark when missing", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/partners.json", () => ({
      default: [
        {
          name: "Fixture",
          url: "https://example.test",
          image: "corporate_partners/fixture.webp",
          imageDark: "corporate_partners/fixture_dark.webp",
        },
      ],
    }))
    const { PARTNERS } = await import("@/lib/data/partners")
    expect(PARTNERS[0].image).toBe("/corporate_partners/fixture.webp")
    expect(PARTNERS[0].imageDark).toBe("/corporate_partners/fixture_dark.webp")
  })

  it("artists: adds the leading slash to a slash-less image path", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/artists.json", () => ({
      default: [
        {
          name: "Fixture",
          genre: "House",
          image: "artists/fixture.webp",
          instagram: "https://instagram.com/fixture",
        },
      ],
    }))
    const { ARTISTS } = await import("@/lib/data/artists")
    expect(ARTISTS[0].image).toBe("/artists/fixture.webp")
  })

  it("press: adds the leading slash to a slash-less image path", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/press.json", () => ({
      default: [
        {
          id: 1,
          outlet: "Fixture Weekly",
          category: "Feature",
          title: "Fixture",
          excerpt: "Fixture excerpt.",
          image: "press/fixture.webp",
          url: "https://example.test/article",
          dateISO: "2026-01-01",
        },
      ],
    }))
    const { PRESS } = await import("@/lib/data/press")
    expect(PRESS[0].image).toBe("/press/fixture.webp")
  })

  it("services: throws on an unknown icon name", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/services.json", () => ({
      default: [
        {
          icon: "NotAnIcon",
          title: "Fixture Service",
          description: "Fixture.",
          features: ["One"],
        },
      ],
    }))
    await expect(import("@/lib/data/services")).rejects.toThrow(/Unknown service icon/)
  })

  it("services: throws on an unknown related-brand key", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/services.json", () => ({
      default: [
        {
          icon: "Music",
          title: "Fixture Service",
          description: "Fixture.",
          features: ["One"],
          relatedBrands: ["not-a-brand"],
        },
      ],
    }))
    await expect(import("@/lib/data/services")).rejects.toThrow(/Unknown related brand/)
  })

  it("brands: adds the leading slash to gallery paths when missing", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/brands.json", () => ({
      default: [
        {
          key: "fixture",
          title: "FIX//TURE",
          tag: "Fixture",
          accent: "#abc",
          description: "Fixture brand.",
          format: "Series",
          gallery: ["brands/fixture-1.webp", "/brands/fixture-2.webp"],
        },
      ],
    }))
    const { BRANDS, brandPlainTitle } = await import("@/lib/data/brands")
    expect(BRANDS[0].gallery).toEqual(["/brands/fixture-1.webp", "/brands/fixture-2.webp"])
    expect(brandPlainTitle(BRANDS[0])).toBe("FIX TURE")
  })

  it("gallery: covers album override, invalid date, nested src, and showOnHome=false", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/gallery.json", () => ({
      default: [
        {
          id: 9001,
          image: "gallery/boiler_boat_003/nested/photo.webp",
          title: "Nested photo",
          alt: "Nested",
          album: "Custom Album Label",
          date: "not-a-date",
          showOnHome: false,
        },
        {
          id: 9002,
          image: "/media/outside/gallery/where_is_west/x.webp",
          title: "Path with gallery mid-segment",
          alt: "Mid",
          caption: 123,
        },
        {
          id: "skip-me",
          image: "/gallery/x.webp",
          title: "Bad id",
          alt: "Bad",
        },
        null,
        {
          id: 9003,
          image: "   ",
          title: "Empty src",
          alt: "Empty",
        },
      ],
    }))
    const {
      GALLERY_PHOTOS,
      GALLERY_CAROUSEL_PHOTOS,
      galleryPathFolderSegmentsFromSrc,
    } = await import("@/lib/data/gallery")

    expect(galleryPathFolderSegmentsFromSrc("/no-gallery/x.webp")).toEqual([])
    expect(galleryPathFolderSegmentsFromSrc("/gallery/only.webp")).toEqual([])

    const nested = GALLERY_PHOTOS.find((p) => p.id === 9001)
    expect(nested?.albumBreadcrumb).toBe("Custom Album Label")
    expect(nested?.albumFolder).toBe("boiler_boat_003")
    expect(nested?.albumPathSegments).toEqual(["boiler_boat_003", "nested"])
    expect(nested?.showOnHome).toBe(false)
    expect(nested?.dateISO).toBe("2026-04-04")

    const mid = GALLERY_PHOTOS.find((p) => p.id === 9002)
    expect(mid?.albumFolder).toBe("where_is_west")
    expect(mid?.caption).toBe("")

    expect(GALLERY_PHOTOS.some((p) => p.id === 9003)).toBe(true)
    expect(GALLERY_CAROUSEL_PHOTOS.every((p) => p.id !== 9001)).toBe(true)
    expect(GALLERY_PHOTOS.every((p) => typeof p.id === "number")).toBe(true)
  })
})
