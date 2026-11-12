import { readFileSync } from "node:fs"
import path from "node:path"
import postcss from "postcss"
import tailwind from "@tailwindcss/postcss"
import { beforeAll, describe, expect, it } from "vitest"

/**
 * LUPFR Website Design v10 shipped broken in 558a5ca (owner, 2026-11-11,
 * live preview screenshot): the Our Brands 4-column grid and 3:2 wide tiles
 * used a px-valued `min-[1201px]:` breakpoint, which Tailwind v4 emits
 * *before* its rem-valued `lg:` rules, so `lg:grid-cols-3` / `lg:aspect-[3/4]`
 * won at every desktop width. Class-presence tests could not see that, so
 * this compiles the real stylesheet and checks the cascade order directly.
 */
const ROOT = path.resolve(__dirname, "../..")
let css = ""

beforeAll(async () => {
  const source = readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
  const result = await postcss([tailwind({ base: ROOT })]).process(source, { from: path.join(ROOT, "app/globals.css") })
  css = result.css
}, 120_000)

function ruleIndex(selector: string): number {
  return css.indexOf(`${selector} {`)
}

/** CSS-escaped selector for a Tailwind class name (enough for these classes). */
function selectorFor(className: string): string {
  return "." + className.replace(/[[\]/:.(),]/g, (c) => `\\${c}`)
}

// The >1200px breakpoint exactly as the component writes it — read from the
// source (not hardcoded here), because Tailwind also scans this test file and
// would otherwise generate whatever class name the test itself mentions.
const COMPONENT = readFileSync(path.join(ROOT, "components/claude-home-brands.tsx"), "utf8")
const WIDE_BREAKPOINT = COMPONENT.match(/(min-\[[^\]]+\]):grid-cols-4/)?.[1] ?? "missing-breakpoint"

describe("Our Brands desktop breakpoint CSS", () => {
  it.each([
    ["grid columns", "lg:grid-cols-3", "grid-cols-4"],
    ["wide tile shape", "lg:aspect-[3/4]", "aspect-[3/2]"],
  ])("emits the >1200px %s rule after the lg rule it overrides", (_label, lgClass, wideUtility) => {
    const lgRule = ruleIndex(selectorFor(lgClass))
    const wideRule = ruleIndex(selectorFor(`${WIDE_BREAKPOINT}:${wideUtility}`))
    expect(lgRule).toBeGreaterThanOrEqual(0)
    expect(wideRule).toBeGreaterThan(lgRule)
  })

  it("generates every desktop-only class the section relies on", () => {
    for (const selector of [
      String.raw`.min-\[75\.0625rem\]\:col-span-2`,
      String.raw`.min-\[75\.0625rem\]\:mt-\[30px\]`,
      String.raw`.lg\:rounded-\[4px\]`,
      String.raw`.lg\:font-condensed`,
      String.raw`.lg\:text-\[clamp\(20px\,2\.4vw\,30px\)\]`,
      String.raw`.lg\:text-\[clamp\(13px\,1\.2vw\,16px\)\]`,
    ]) {
      expect(ruleIndex(selector), selector).toBeGreaterThanOrEqual(0)
    }
  })
})
