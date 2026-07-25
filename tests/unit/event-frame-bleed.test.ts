/**
 * Event thumbnails get a consistent code-drawn frame (poster-agnostic), and the
 * carousels bleed to the true viewport right edge (owner request 2026-07-25).
 * Source-string assertions, matching tests/unit/past-events-compact.test.ts.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const eventsSource = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")

describe("event card dynamic frame", () => {
  it("draws one code frame overlay marked event-card-frame (not per-poster art)", () => {
    expect(eventsSource).toContain("event-card-frame")
    // inset so it merges with the existing corner brackets at 10px
    expect(eventsSource).toMatch(/event-card-frame[\s\S]{0,160}inset-\[10px\]/)
  })
})

describe("carousel right-edge bleed", () => {
  it("exposes a bleedRight prop and applies a viewport bleed to the right edge", () => {
    expect(eventsSource).toContain("bleedRight")
    expect(eventsSource).toContain("events-bleed-right")
    expect(eventsSource).toContain("mr-[calc(50%-50vw)]")
  })

  it("enables the bleed on the Past carousel", () => {
    const pastIdx = eventsSource.indexOf("Past\n")
    expect(pastIdx).toBeGreaterThan(-1)
    expect(eventsSource.slice(pastIdx)).toMatch(/<EventsCarousel[\s\S]{0,600}bleedRight/)
  })
})
