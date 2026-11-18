import { describe, expect, it } from "vitest"
import { isFreshWheel, snapTarget, stackPositions } from "@/lib/stack-snap"

describe("stackPositions", () => {
  it("puts each stop where the card's natural top meets its sticky top", () => {
    expect(stackPositions(1000, 624, [92, 108, 124])).toEqual([908, 1516, 2124])
    expect(stackPositions(0, 100, [])).toEqual([])
  })
})

describe("snapTarget", () => {
  const stops = [900, 1500, 2100]
  const entry = 400

  it("scrolls normally above the entry zone and with no stops", () => {
    expect(snapTarget(100, 1, stops, entry)).toBeNull()
    expect(snapTarget(100, 1, [], entry)).toBeNull()
    expect(snapTarget(100, -1, [], entry)).toBeNull()
  })

  it("snaps to the first card from inside the entry zone, then card by card", () => {
    expect(snapTarget(600, 1, stops, entry)).toBe(900)
    expect(snapTarget(900, 1, stops, entry)).toBe(1500)
    expect(snapTarget(1503, 1, stops, entry)).toBe(2100)
  })

  it("treats a small drift as being on the stop", () => {
    expect(snapTarget(1495, 1, stops, entry)).toBe(2100)
    expect(snapTarget(1505, -1, stops, entry)).toBe(900)
  })

  it("lets the page leave after the last card and before the first", () => {
    expect(snapTarget(2100, 1, stops, entry)).toBeNull()
    expect(snapTarget(2500, 1, stops, entry)).toBeNull()
    expect(snapTarget(900, -1, stops, entry)).toBeNull()
    expect(snapTarget(500, -1, stops, entry)).toBeNull()
  })

  it("snaps back up card by card, including from just below the last card", () => {
    expect(snapTarget(2100, -1, stops, entry)).toBe(1500)
    expect(snapTarget(1500, -1, stops, entry)).toBe(900)
    expect(snapTarget(2300, -1, stops, entry)).toBe(2100)
    expect(snapTarget(2600, -1, stops, entry)).toBeNull()
  })
})

describe("isFreshWheel", () => {
  it("treats a pause or a growing delta as a new gesture, and a shrinking tail as inertia", () => {
    expect(isFreshWheel(40, 30, 16)).toBe(false)
    expect(isFreshWheel(40, 40, 16)).toBe(false)
    expect(isFreshWheel(10, 60, 16)).toBe(true)
    expect(isFreshWheel(40, 30, 200)).toBe(true)
  })
})
