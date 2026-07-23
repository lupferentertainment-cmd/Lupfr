/**
 * Past event cards must stay visibly smaller than Upcoming (owner request 2026-07-21/22).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const eventsSource = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")

describe("past events compact footprint", () => {
  it("uses a smaller desktop/mobile basis than the Upcoming 324px cards", () => {
    expect(eventsSource).toContain("md:basis-[324px]")
    expect(eventsSource).toMatch(/compact[\s\S]{0,120}basis-\[min\(180px,70vw\)\]/)
    expect(eventsSource).toContain("md:basis-[196px]")
    expect(eventsSource).not.toContain("md:basis-[232px]")
  })

  it("marks the Past carousel with data-compact for Playwright/RTL probes", () => {
    expect(eventsSource).toMatch(/data-compact=\{compact \? "true" : undefined\}/)
  })

  it("passes compact to the Past EventsCarousel only", () => {
    const pastIdx = eventsSource.indexOf("Past\n")
    expect(pastIdx).toBeGreaterThan(-1)
    const pastBlock = eventsSource.slice(pastIdx)
    expect(pastBlock).toMatch(/<EventsCarousel[\s\S]{0,400}\bcompact\b/)
  })
})
