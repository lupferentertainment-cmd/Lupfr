/**
 * Past events are archive-only (owner request 2026-08-05): the home landing
 * section shows Upcoming, and the full Past archive lives on /events.
 *
 * The compact card footprint (owner request 2026-07-21/22) still has to be
 * smaller than the 324px Upcoming cards, since EventsCarousel keeps the prop
 * for the archive surface.
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

describe("past events are not on the landing page", () => {
  it("the home Events section renders no Past heading or archive carousel", () => {
    expect(eventsSource).not.toMatch(/>\s*Past\s*</)
    expect(eventsSource).not.toContain('id="past-events"')
  })

  it("the home Events section does not even read the past list", () => {
    expect(eventsSource).not.toContain("getPastEvents")
  })

  it("still renders the Upcoming carousel", () => {
    expect(eventsSource).toContain("getUpcomingEvents")
    expect(eventsSource).toContain("md:basis-[324px]")
  })
})

describe("past events remain on the /events archive", () => {
  it("the events directory still lists past events behind its Past filter", () => {
    expect(directorySource).toContain("getPastEvents")
    expect(directorySource).toMatch(/aria-label="Past events"/)
  })
})

describe("compact card footprint stays smaller than Upcoming", () => {
  it("keeps the smaller desktop/mobile basis available on EventsCarousel", () => {
    expect(eventsSource).toMatch(/compact[\s\S]{0,120}basis-\[min\(180px,70vw\)\]/)
    expect(eventsSource).toContain("md:basis-[196px]")
    expect(eventsSource).not.toContain("md:basis-[232px]")
  })

  it("marks a compact carousel with data-compact for Playwright/RTL probes", () => {
    expect(eventsSource).toMatch(/data-compact=\{compact \? "true" : undefined\}/)
  })
})
