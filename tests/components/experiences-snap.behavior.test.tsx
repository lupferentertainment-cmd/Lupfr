/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"

vi.mock("@/components/lazy-loop-video", () => ({ LazyLoopVideo: () => <video /> }))

import { ClaudeHomeExperiences } from "@/components/claude-home-experiences"

// Container at document y=1000, cards 600 tall with sticky tops 92/108/124 => stops 908 / 1492 / 2076.
const STOPS = [908, 1492, 2076]
let now = 10_000
let scrollTo: ReturnType<typeof vi.fn>

function setScroll(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true })
}

function wheel(deltaY: number, init: WheelEventInit = {}, target: EventTarget = window) {
  const e = new WheelEvent("wheel", { deltaY, cancelable: true, bubbles: true, ...init })
  // happy-dom's WheelEvent does not copy every init field; pin the ones the controller reads.
  Object.defineProperty(e, "deltaY", { value: deltaY })
  Object.defineProperty(e, "deltaX", { value: init.deltaX ?? 0 })
  Object.defineProperty(e, "ctrlKey", { value: init.ctrlKey ?? false })
  target.dispatchEvent(e)
  return e
}

function key(k: string, init: KeyboardEventInit = {}, target: EventTarget = document.body) {
  const e = new KeyboardEvent("keydown", { key: k, cancelable: true, bubbles: true, ...init })
  target.dispatchEvent(e)
  return e
}

function touch(type: string, y: number, cancelable = true) {
  const e = new Event(type, { cancelable, bubbles: true }) as Event & { touches: unknown[]; changedTouches: unknown[] }
  e.touches = type === "touchend" ? [] : [{ clientY: y }]
  e.changedTouches = [{ clientY: y }]
  window.dispatchEvent(e)
  return e
}

beforeEach(() => {
  now = 10_000
  vi.spyOn(performance, "now").mockImplementation(() => now)
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    // Only the cards' wrapper is measured by the snap controller (the covered-cards hook reads card tops).
    const top = 1000 - window.scrollY
    return { top, bottom: top + 1800, left: 0, right: 0, width: 0, height: 1800, x: 0, y: top, toJSON: () => ({}) }
  })
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { value: 600, configurable: true })
  scrollTo = vi.fn()
  vi.spyOn(window, "scrollTo").mockImplementation(scrollTo as never)
  Object.defineProperty(window, "innerHeight", { value: 800, configurable: true })
  setScroll(0)
})

afterEach(() => {
  vi.restoreAllMocks()
  // @ts-expect-error restoring the jsdom-style default
  delete HTMLElement.prototype.offsetHeight
})

describe("Featured Experiences card-by-card snapping", () => {
  it("scrolls normally above the entry zone and snaps to card 1 once inside it", () => {
    render(<ClaudeHomeExperiences />)
    expect(wheel(100).defaultPrevented).toBe(false)
    expect(scrollTo).not.toHaveBeenCalled()

    setScroll(600)
    expect(wheel(100).defaultPrevented).toBe(true)
    expect(scrollTo).toHaveBeenCalledWith({ top: STOPS[0], behavior: "smooth" })
  })

  it("swallows ticks while the snap is in flight and the inertia tail after it, then steps to the next card on a fresh gesture", () => {
    render(<ClaudeHomeExperiences />)
    setScroll(STOPS[0]!)
    wheel(100)
    expect(scrollTo).toHaveBeenCalledTimes(1)
    // Inertia tail: events every ~16ms with shrinking deltas, well past the lock window.
    for (let delta = 90; delta > 20; delta -= 2) {
      now += 16
      expect(wheel(delta).defaultPrevented).toBe(true)
    }
    expect(scrollTo).toHaveBeenCalledTimes(1)
    now += 400
    wheel(100)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: STOPS[1], behavior: "smooth" })
  })

  it("lets the page leave after the last card, and snaps back up one card at a time", () => {
    render(<ClaudeHomeExperiences />)
    setScroll(STOPS[2]!)
    expect(wheel(100).defaultPrevented).toBe(false)
    expect(wheel(-100).defaultPrevented).toBe(true)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: STOPS[1], behavior: "smooth" })
    now += 2000
    setScroll(STOPS[0]!)
    expect(wheel(-100).defaultPrevented).toBe(false)
  })

  it("ignores pinch-zoom, horizontal scrolls, zero deltas and wheels inside dialogs or inputs", () => {
    const { container } = render(
      <>
        <div role="dialog"><span id="in-dialog" /></div>
        <input id="field" />
        <ClaudeHomeExperiences />
      </>
    )
    setScroll(STOPS[0]!)
    expect(wheel(100, { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(wheel(10, { deltaX: 50 }).defaultPrevented).toBe(false)
    expect(wheel(0).defaultPrevented).toBe(false)
    expect(wheel(100, {}, container.querySelector("#in-dialog")!).defaultPrevented).toBe(false)
    expect(wheel(100, {}, container.querySelector("#field")!).defaultPrevented).toBe(false)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it("handles arrow, page and space keys from the page, but not from controls", () => {
    const { container } = render(
      <>
        <button id="btn" />
        <ClaudeHomeExperiences />
      </>
    )
    setScroll(STOPS[0]!)
    expect(key("ArrowDown").defaultPrevented).toBe(true)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: STOPS[1], behavior: "smooth" })
    now += 1000
    setScroll(STOPS[1]!)
    expect(key(" ", { shiftKey: true }).defaultPrevented).toBe(true)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: STOPS[0], behavior: "smooth" })
    const calls = scrollTo.mock.calls.length
    expect(key("PageDown").defaultPrevented).toBe(true) // locked: swallowed, no second scroll
    expect(scrollTo.mock.calls.length).toBe(calls)
    expect(key("PageUp").defaultPrevented).toBe(true)
    expect(key("a").defaultPrevented).toBe(false)
    expect(key("ArrowDown", { metaKey: true }).defaultPrevented).toBe(false)
    expect(key("ArrowDown", {}, container.querySelector("#btn")!).defaultPrevented).toBe(false)
    now += 1000
    setScroll(3000)
    expect(key("ArrowDown").defaultPrevented).toBe(false)
  })

  it("turns a swipe inside the zone into a card step, and leaves swipes outside it alone", () => {
    render(<ClaudeHomeExperiences />)
    setScroll(STOPS[0]!)
    touch("touchstart", 500)
    expect(touch("touchmove", 400).defaultPrevented).toBe(true)
    expect(touch("touchmove", 350).defaultPrevented).toBe(true)
    touch("touchend", 350)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: STOPS[1], behavior: "smooth" })

    scrollTo.mockClear()
    now += 2000
    touch("touchstart", 500)
    touch("touchmove", 497)
    touch("touchmove", 490)
    touch("touchend", 490) // moved < SWIPE_MIN_PX
    expect(scrollTo).not.toHaveBeenCalled()

    setScroll(0)
    touch("touchstart", 500)
    expect(touch("touchmove", 300).defaultPrevented).toBe(false)
    touch("touchend", 300)
    expect(scrollTo).not.toHaveBeenCalled()

    setScroll(STOPS[1]!)
    touch("touchstart", 300)
    expect(touch("touchmove", 400, false).defaultPrevented).toBe(false) // not cancelable
    touch("touchend", 400)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: STOPS[0], behavior: "smooth" })
  })

  it("jumps instantly under prefers-reduced-motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList)
    render(<ClaudeHomeExperiences />)
    setScroll(STOPS[0]!)
    wheel(100)
    expect(scrollTo).toHaveBeenCalledWith({ top: STOPS[1], behavior: "auto" })
  })

  it("stops intercepting once unmounted", () => {
    const { unmount } = render(<ClaudeHomeExperiences />)
    unmount()
    setScroll(STOPS[0]!)
    expect(wheel(100).defaultPrevented).toBe(false)
  })
})
