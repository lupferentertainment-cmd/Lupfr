/**
 * VIEW DECK: the HIGH//RISE and LUPFR pitch decks shipped from the July 24 owner
 * zip (deferred there, shipped 2026-07-27). Locks the slide assets, the brand
 * data wiring, the viewer contract, and where each deck is mounted.
 * Source-string assertions, matching tests/unit/event-frame-bleed.test.ts.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { BRANDS, LUPFR_DECK } from "@/lib/data/brands"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const read = (...p: string[]) => fs.readFileSync(path.join(rootDir, ...p), "utf8")

const deckSource = read("components", "brand-deck.tsx")
const brandPageSource = read("app", "brands", "[slug]", "page.tsx")
const brandsIndexSource = read("app", "brands", "page.tsx")

describe("deck slide assets", () => {
  it("ships all 7 HIGH//RISE slides as WebP under public/brands/", () => {
    for (let i = 1; i <= 7; i += 1) {
      const rel = path.join("public", "brands", `highrise-deck-${i}.webp`)
      expect(fs.existsSync(path.join(rootDir, rel)), `${rel} missing`).toBe(true)
    }
  })

  it("ships all 5 LUPFR slides as WebP under public/brands/", () => {
    for (let i = 1; i <= 5; i += 1) {
      const rel = path.join("public", "brands", `lupfr-deck-${i}.webp`)
      expect(fs.existsSync(path.join(rootDir, rel)), `${rel} missing`).toBe(true)
    }
  })
})

describe("deck data wiring", () => {
  it("HIGH//RISE brand carries its 7-slide deck in order, site-root normalized", () => {
    const highrise = BRANDS.find((b) => b.key === "highrise")
    expect(highrise).toBeDefined()
    expect(highrise?.deck).toHaveLength(7)
    expect(highrise?.deck?.[0]).toBe("/brands/highrise-deck-1.webp")
    expect(highrise?.deck?.every((s) => s.startsWith("/brands/"))).toBe(true)
  })

  it("exposes the parent LUPFR deck (5 slides) for the /brands index", () => {
    expect(LUPFR_DECK).toHaveLength(5)
    expect(LUPFR_DECK[0]).toBe("/brands/lupfr-deck-1.webp")
  })

  it("does not add a deck to brands that were not given one", () => {
    expect(BRANDS.find((b) => b.key === "seaside")?.deck).toBeUndefined()
  })
})

describe("deck viewer contract", () => {
  it("is a client component exposing a VIEW DECK trigger", () => {
    expect(deckSource).toContain('"use client"')
    expect(deckSource).toMatch(/VIEW DECK/i)
  })

  it("supports keyboard paging and escape via the shared dialog", () => {
    expect(deckSource).toContain("ArrowRight")
    expect(deckSource).toContain("ArrowLeft")
    expect(deckSource).toContain("@/components/ui/dialog")
  })

  it("shows a slide counter so the deck reads as an ordered deck", () => {
    expect(deckSource).toMatch(/length/)
    expect(deckSource).toMatch(/aria-label|aria-live/)
  })
})

describe("deck mounting", () => {
  it("mounts the brand deck on the brand detail page", () => {
    expect(brandPageSource).toContain("BrandDeck")
  })

  it("mounts the LUPFR deck on the /brands index", () => {
    expect(brandsIndexSource).toContain("BrandDeck")
    expect(brandsIndexSource).toContain("LUPFR_DECK")
  })
})
