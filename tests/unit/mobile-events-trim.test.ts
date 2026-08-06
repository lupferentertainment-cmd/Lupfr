import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const events = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")

describe("mobile events main-thread trim", () => {
  it("keeps Upcoming eager and does not wrap #events in DeferredHomeSection", () => {
    expect(events).toContain('id="events"')
    expect(events).toContain("Upcoming")
    expect(events).not.toContain("DeferredHomeSection")
    // Upcoming carousel mounts unconditionally when there are events.
    expect(events).toMatch(
      /Upcoming[\s\S]*?\{upcoming\.length > 0 \? \(\s*<EventsCarousel/
    )
  })

  it("no longer mounts a Past carousel below the fold", () => {
    // Past events moved to /events on 2026-08-05, so the landing page does not
    // read or render them at all — the cheapest possible mobile main thread.
    expect(events).not.toContain("getPastEvents")
    expect(events).not.toContain("past.length > 0")
  })

  it("uses static card inners on mobile while preserving tilt shell + m.article", () => {
    expect(events).toContain("const staticInner = isMobile !== false")
    expect(events).toContain("staticInner={staticInner}")
    expect(events).toContain("function EventCardTiltShell")
    expect(events).toContain("import { m,")
    expect(events).toContain("<m.article")
    expect(events).toContain("prioritizeFirstImage={isMobile === false}")
  })
})
