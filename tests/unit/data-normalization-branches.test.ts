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
})
