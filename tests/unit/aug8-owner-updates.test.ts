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
  // big image)." Superseded by the owner's 2026-08-28 poster-tile restructure:
  // both sections now share components/poster-tile.tsx (`.lp-poster-tile`),
  // whose aspect ratio the design canvas itself swaps from a tall 3:4 to a
  // short, wide 5:3 under 480px — ported verbatim in app/globals.css — so a
  // phone still sees more than one tile while scrolling.
  const brandsSource = read("components", "brands.tsx")
  const servicesSource = read("components", "services.tsx")
  const cssSource = read("app", "globals.css")

  it("both home grids render tiles through the shared .lp-poster-tile component", () => {
    expect(brandsSource).toContain("<PosterTile") // via <PosterTile>'s own className
    expect(servicesSource).toContain("PosterTile")
  })

  it("the poster tile is a tall 3:4 on desktop and a short 5:3 under 480px", () => {
    expect(cssSource).toMatch(/\.lp-poster-tile\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/)
    expect(cssSource).toMatch(
      /@media \(max-width: 480px\)\s*\{\s*\.lp-poster-tile\s*\{[^}]*aspect-ratio:\s*5\s*\/\s*3/
    )
  })
})

describe("Laylo drop embed (owner 2026-08-08)", () => {
  const laylo = read("components", "laylo-embed.tsx")
  const homePage = read("components", "home-page.tsx")

  it("keeps the owner's drop id and brand colour verbatim", () => {
    expect(laylo).toContain("dropId=2qWvZ")
    expect(laylo).toContain("color=FED455")
    expect(laylo).toContain("minimal=false")
    expect(laylo).toContain('id="laylo-drop-2qWvZ"')
  })

  it("renders the widget in dark theme to match the site", () => {
    // The owner's original snippet specified `theme=light`, which shipped as a
    // white panel on the dark site — flagged with a screenshot and then
    // switched to dark. Pinned so a future copy-paste of the original snippet
    // does not silently reintroduce the white block.
    expect(laylo).toContain("theme=dark")
    expect(laylo).not.toContain("theme=light")
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
    // "Our Team" -> "The Founders" (owner punch list, 2026-09-02).
    ["components/team.tsx", "Founders"],
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
