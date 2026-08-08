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
