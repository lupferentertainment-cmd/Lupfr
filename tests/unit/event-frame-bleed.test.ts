/**
 * The code-drawn inset poster frame (`.event-card-frame`, added 2026-07-25,
 * made conditional via `bakedFrame` on 2026-07-27) was retired 2026-08-29 per
 * the owner's design-file punch list: "Remove the border line around each
 * event image - have it look just like the claude design file on desktop."
 * These specs now lock its absence instead of its (former) conditional
 * presence, so it can't silently come back. Carousels still bleed to the
 * viewport edge — unrelated, unchanged, covered below.
 * Source-string assertions, matching tests/unit/past-events-compact.test.ts.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const eventsSource = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")
const directorySource = fs.readFileSync(
  path.join(rootDir, "components", "events-directory.tsx"),
  "utf8"
)
const globalsCss = fs.readFileSync(path.join(rootDir, "app", "globals.css"), "utf8")
const eventsYaml = fs.readFileSync(path.join(rootDir, "data", "events.yml"), "utf8")

describe("poster inset frame — retired", () => {
  it("home carousel no longer draws the inset frame or reads bakedFrame", () => {
    expect(eventsSource).not.toContain("event-card-frame")
    expect(eventsSource).not.toContain("bakedFrame")
  })

  it("the /events directory no longer draws the inset frame or reads bakedFrame", () => {
    expect(directorySource).not.toContain("event-card-frame")
    expect(directorySource).not.toContain("bakedFrame")
  })

  it("the CSS rule is gone", () => {
    expect(globalsCss).not.toContain(".event-card-frame")
  })

  it("data/events.yml no longer carries the now-meaningless bakedFrame flag", () => {
    expect(eventsYaml).not.toContain("bakedFrame")
  })
})

describe("carousel right-edge bleed", () => {
  it("exposes a bleedRight prop and applies a viewport bleed to the right edge", () => {
    expect(eventsSource).toContain("bleedRight")
    expect(eventsSource).toContain("events-bleed-right")
    expect(eventsSource).toContain("mr-[calc(50%-50vw)]")
  })

  it("enables the bleed on the Upcoming carousel", () => {
    // The Past carousel left the landing page on 2026-08-05 (archive is /events),
    // so Upcoming is the only carousel here that needs the right-edge bleed.
    const idx = eventsSource.indexOf("upcoming.length > 0")
    expect(idx).toBeGreaterThan(-1)
    expect(eventsSource.slice(idx)).toMatch(/<EventsCarousel[\s\S]{0,600}bleedRight/)
  })
})
