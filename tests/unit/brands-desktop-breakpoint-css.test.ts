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
  const selector = "." + className.replace(/[[\]/:.(),%]/g, (c) => `\\${c}`)
  return css.indexOf(`${selector} {`)
}

function expectAscending(classNames: string[]) {
  const indexes = classNames.map(ruleIndex)
  classNames.forEach((c, i) => expect(indexes[i], `${c} must be generated`).toBeGreaterThanOrEqual(0))
  for (let i = 1; i < indexes.length; i++) {
    expect(indexes[i], `${classNames[i]} must come after ${classNames[i - 1]}`).toBeGreaterThan(indexes[i - 1])
  }
}

describe("v5/v6 responsive cascade order", () => {
  it("Our Brands (v6): 4 columns, then 2 at <=900px; the number shrinks at <=560px", () => {
    expectAscending(["grid-cols-4", "max-[900px]:grid-cols-2"])
    expectAscending(["text-[44px]", "max-[560px]:text-[32px]"])
  })

  it("Services (v6): the 2:1 slanted tile becomes a full-width 190px tile at <=900px, and the row stacks", () => {
    expectAscending(["aspect-[2/1]", "max-[900px]:aspect-auto"])
    expectAscending(["w-[34.84%]", "max-[900px]:w-full"])
    expectAscending(["-ml-[2.265%]", "max-[900px]:ml-0"])
    expectAscending(["flex", "max-[900px]:flex-col"])
  })

  it("Featured Experiences: the stack card height is overridden at <=900px", () => {
    expectAscending(["h-[min(80vh,760px)]", "max-[900px]:h-[74vh]"])
  })
})
