/**
 * Event thumbnails draw a code frame ONLY on posters without a baked-in border
 * (owner 2026-07-27, conditional): borderless posters (Third Thursday's) read
 * framed, while posters that bake their own rectangle (Gas Money, Shamrock) opt
 * out via `bakedFrame` so they don't show a double border. Same treatment on the
 * home carousel and the /events directory. Carousels bleed to the viewport edge.
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

describe("conditional poster-agnostic frame", () => {
  it("home carousel gates the frame on bakedFrame (borderless posters only)", () => {
    expect(eventsSource).toContain("event-card-frame")
    expect(eventsSource).toContain("bakedFrame")
  })

  it("the /events directory renders the same conditional frame", () => {
    expect(directorySource).toContain("event-card-frame")
    expect(directorySource).toContain("bakedFrame")
  })

  it("frame is a dual-tone inset (light + dark hairline) so it reads on any poster", () => {
    const rule = globalsCss.match(/\.event-card-frame\s*\{[^}]*\}/)?.[0] ?? ""
    expect(rule).toMatch(/rgba\(255,\s*255,\s*255/) // light line for dark posters
    expect(rule).toMatch(/rgba\(0,\s*0,\s*0/) //        dark line for light posters
  })

  it("both hairlines are opaque enough to read on their opposite background", () => {
    // Regression: at 0.34 the dark line vanished on light poster art, so
    // Third Thursday's (cream border baked into the poster) showed no frame
    // at all while dark posters looked fine. Seen live 2026-07-28.
    const rule = globalsCss.match(/\.event-card-frame\s*\{[^}]*\}/)?.[0] ?? ""
    const alphas = [...rule.matchAll(/rgba\(\s*(?:255,\s*255,\s*255|0,\s*0,\s*0)\s*,\s*([\d.]+)\s*\)/g)].map(
      (m) => Number(m[1])
    )
    expect(alphas.length).toBeGreaterThanOrEqual(2)
    for (const a of alphas) expect(a).toBeGreaterThanOrEqual(0.45)
  })

  it("posters that bake their own border opt out via bakedFrame: true", () => {
    expect(eventsYaml).toMatch(/slug: gas-money-eria-marina[\s\S]{0,400}bakedFrame: true/)
    expect(eventsYaml).toMatch(/slug: shamrock-house[\s\S]{0,400}bakedFrame: true/)
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
