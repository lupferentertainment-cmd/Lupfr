import { readFileSync } from "node:fs"
import path from "node:path"
import postcss from "postcss"
import tailwind from "@tailwindcss/postcss"
import { beforeAll, describe, expect, it } from "vitest"

/**
 * Cascade-order guard for the v5 (2026-11-17) responsive sections. Tailwind v4
 * sorts px-valued `max-[…]` variants after the base utility and from the
 * widest breakpoint to the narrowest, which is what lets "3 columns at
 * <=1100px, 2 at <=720px, 1 at <=480px" work. Class-presence tests cannot see
 * a broken order (v10 shipped one in 558a5ca), so this compiles the real
 * stylesheet and checks the order of the rules each section depends on.
 */
const ROOT = path.resolve(__dirname, "../..")
let css = ""

beforeAll(async () => {
  const source = readFileSync(path.join(ROOT, "app/globals.css"), "utf8")
  const result = await postcss([tailwind({ base: ROOT })]).process(source, { from: path.join(ROOT, "app/globals.css") })
  css = result.css
}, 120_000)

function ruleIndex(className: string): number {
  const selector = "." + className.replace(/[[\]/:.(),]/g, (c) => `\\${c}`)
  return css.indexOf(`${selector} {`)
}

function expectAscending(classNames: string[]) {
  const indexes = classNames.map(ruleIndex)
  classNames.forEach((c, i) => expect(indexes[i], `${c} must be generated`).toBeGreaterThanOrEqual(0))
  for (let i = 1; i < indexes.length; i++) {
    expect(indexes[i], `${classNames[i]} must come after ${classNames[i - 1]}`).toBeGreaterThan(indexes[i - 1])
  }
}

describe("v5 responsive cascade order", () => {
  it("Our Brands: 6 columns, then 3 at <=1100px, 2 at <=720px, 1 at <=480px", () => {
    expectAscending(["grid-cols-6", "max-[1100px]:grid-cols-3", "max-[720px]:grid-cols-2", "max-[480px]:grid-cols-1"])
  })

  it("Our Brands: the 3:4 tile becomes 5:3 at <=480px; the photo filter and revealed copy relax at <=1100px", () => {
    expectAscending(["aspect-[3/4]", "max-[480px]:aspect-[5/3]"])
    expectAscending(["brightness-[.72]", "max-[1100px]:brightness-100"])
    expectAscending(["max-h-0", "max-[1100px]:max-h-[90px]"])
    expectAscending(["max-[1100px]:max-h-[90px]", "max-[480px]:text-[30px]"])
  })

  it("Services: 16:10 cards (4:3 from 901 to 1250px), then 4:3 tiles at <=900px and 5:3 at <=560px", () => {
    expectAscending(["aspect-[16/10]", "max-[900px]:aspect-[4/3]", "max-[560px]:aspect-[5/3]"])
    expectAscending(["aspect-[16/10]", "max-[1250px]:min-[901px]:aspect-[4/3]"])
  })

  it("Featured Experiences: the stack card height is overridden at <=900px", () => {
    expectAscending(["h-[min(80vh,760px)]", "max-[900px]:h-[74vh]"])
  })
})
