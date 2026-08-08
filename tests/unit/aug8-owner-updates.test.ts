/**
 * Owner delivery 2026-08-08 ("LUPFR - Website UPDATES" + AUG 8 restructure zip).
 *
 * Two source-string guardrails from that email:
 *   1. "EVENTS - only change is to remove the colored borders and make it look
 *      like claude file." The design file frames every event card in the neutral
 *      `var(--border)` hairline; brand identity reads through the tag text only.
 *   2. "Make each section header one line (ex: FEATURED ARTISTS not [split])."
 *
 * Source-string assertions, matching tests/unit/event-frame-bleed.test.ts.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const read = (...p: string[]) => fs.readFileSync(path.join(rootDir, ...p), "utf8")

const eventsSource = read("components", "events.tsx")
const directorySource = read("components", "events-directory.tsx")

describe("event cards drop per-brand border colour (owner 2026-08-08)", () => {
  it("home carousel never paints the card border with the brand accent", () => {
    expect(eventsSource).not.toContain("border-[color:var(--event-brand)]")
    expect(eventsSource).toContain("border-border hover:border-accent/50")
  })

  it("home carousel corner brackets stay neutral (no accent borderColor override)", () => {
    expect(eventsSource).not.toMatch(/cornerStyle\s*=\s*brandAccent/)
  })

  it("neither card surface sets borderColor from the brand accent", () => {
    for (const source of [eventsSource, directorySource]) {
      expect(source).not.toMatch(/borderColor:\s*(brandAccent|accent)\b/)
    }
  })

  it("the brand tag keeps accent *text* colour so the brand still reads", () => {
    expect(eventsSource).toMatch(/style=\{brandAccent \? \{ color: brandAccent \} : undefined\}/)
    expect(directorySource).toMatch(/style=\{accent \? \{ color: accent \} : undefined\}/)
  })
})

describe("mobile brand/service tiles are short enough to see several (owner 2026-08-08)", () => {
  // "Mobile: Size the OUR BRANDS and OUR SERVICES tiles just like how I did in
  // Claude. You want to be able to see multiple while scrolling (vs. just one
  // big image)." The design file's mobile brand slat is 132px; ours carry more
  // copy, so the floor is lower rather than equal — the point is that a phone
  // viewport fits more than one tile.
  const brandsSource = read("components", "brands.tsx")
  const servicesSource = read("components", "services.tsx")

  it("the brand tile's mobile floor is no taller than its desktop floor", () => {
    const mobile = Number(brandsSource.match(/min-h-\[(\d+)px\]/)?.[1])
    const desktop = Number(brandsSource.match(/sm:min-h-\[(\d+)px\]/)?.[1])
    expect(mobile).toBeGreaterThan(0)
    expect(desktop).toBeGreaterThan(0)
    // Regression: mobile used to be 460px against a 340px desktop floor.
    expect(mobile).toBeLessThanOrEqual(desktop)
  })

  it("at least two brand tiles fit an 844px phone viewport", () => {
    const mobile = Number(brandsSource.match(/min-h-\[(\d+)px\]/)?.[1])
    expect(mobile * 2).toBeLessThanOrEqual(844)
  })

  it("the service card's mobile poster is shorter than its desktop poster", () => {
    const m = servicesSource.match(/h-\[(\d+)px\]\s+sm:h-\[(\d+)px\]/)
    if (!m) throw new Error("service card poster height classes not found")
    expect(Number(m[1])).toBeLessThan(Number(m[2]))
    expect(Number(m[1])).toBeLessThanOrEqual(140)
  })
})

describe("Laylo drop embed (owner 2026-08-08)", () => {
  const laylo = read("components", "laylo-embed.tsx")
  const homePage = read("components", "home-page.tsx")

  it("keeps the owner's drop id and query params verbatim", () => {
    expect(laylo).toContain("dropId=2qWvZ")
    expect(laylo).toContain("color=FED455")
    expect(laylo).toContain("minimal=false")
    expect(laylo).toContain("theme=light")
    expect(laylo).toContain('id="laylo-drop-2qWvZ"')
  })

  it("loads the SDK that resizes the frame, off the critical path", () => {
    expect(laylo).toContain("https://embed.laylo.com/laylo-sdk.js")
    expect(laylo).toContain('strategy="lazyOnload"')
  })

  it("keeps Laylo's responsive-iframe width idiom intact", () => {
    // width:1px + min-width:100% is deliberate, not a typo — dropping the 1px
    // makes the frame refuse to shrink inside a flex/grid parent.
    expect(laylo).toMatch(/width:\s*"1px"/)
    expect(laylo).toMatch(/minWidth:\s*"100%"/)
  })

  it("gives the iframe an accessible title", () => {
    expect(laylo).toMatch(/title="[^"]+"/)
  })

  it("is mounted on the home page", () => {
    expect(homePage).toContain("<LayloEmbed />")
  })
})

describe("section headers render on one line (owner 2026-08-08)", () => {
  const splitHeadings: Array<[string, string]> = [
    ["components/artists.tsx", "Artists"],
    ["components/team.tsx", "Team"],
    ["components/contact.tsx", "Something"],
  ]

  for (const [file, subline] of splitHeadings) {
    it(`${file} no longer hard-breaks before "${subline}"`, () => {
      const source = read(...file.split("/"))
      const idx = source.indexOf(`className="lupfr-heading-subline">${subline}`)
      expect(idx).toBeGreaterThan(-1)
      // The 120 chars before the subline span must not contain a <br />.
      expect(source.slice(Math.max(0, idx - 120), idx)).not.toContain("<br />")
    })
  }
})
