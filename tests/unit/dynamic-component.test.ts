import { describe, expect, it } from "vitest"

import { resolveDynamicComponent } from "@/lib/dynamic-component"

function ExampleSection() {
  return null
}

describe("dynamic component resolver", () => {
  it("returns a named React component export", () => {
    expect(resolveDynamicComponent({ Events: ExampleSection }, "Events", "events")).toBe(ExampleSection)
  })

  it("rejects a missing named export before React lazy renders", () => {
    expect(() => resolveDynamicComponent({ Events: undefined }, "Events", "events")).toThrow(
      "events must export a React component named Events."
    )
  })
})
