/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  DEFERRED_SECTION_IDS,
  deferredSectionShouldMountForHash,
  realignHashTargetUntilStable,
} from "@/lib/hash-scroll"

/**
 * Unit spec for the home-page hash-scroll helpers.
 *
 * Root cause these guard against: navigating to a deferred section (#news /
 * #about / #team / #contact) used to mount only the target, leaving the deferred
 * sections *above* it as wrong-height placeholders — so the target's scroll
 * position kept drifting while async chunks loaded, and a cascade of blind
 * timers chased it for ~2s ("takes forever to scroll").
 */

describe("deferredSectionShouldMountForHash", () => {
  it("exposes the deferred sections top-to-bottom", () => {
    expect(DEFERRED_SECTION_IDS).toEqual(["news", "about", "team", "contact"])
  })

  it("mounts a section when the hash targets it directly", () => {
    expect(deferredSectionShouldMountForHash("news", "#news")).toBe(true)
    expect(deferredSectionShouldMountForHash("about", "#about")).toBe(true)
    expect(deferredSectionShouldMountForHash("contact", "#contact")).toBe(true)
  })

  it("mounts sections ABOVE the target so the target lands at a stable position", () => {
    // Target #contact needs news + about + team at real height to be positioned right.
    expect(deferredSectionShouldMountForHash("news", "#contact")).toBe(true)
    expect(deferredSectionShouldMountForHash("about", "#contact")).toBe(true)
    expect(deferredSectionShouldMountForHash("team", "#contact")).toBe(true)
    expect(deferredSectionShouldMountForHash("news", "#about")).toBe(true)
    expect(deferredSectionShouldMountForHash("about", "#team")).toBe(true)
  })

  it("does NOT eagerly mount sections BELOW the target", () => {
    expect(deferredSectionShouldMountForHash("contact", "#about")).toBe(false)
    expect(deferredSectionShouldMountForHash("team", "#about")).toBe(false)
    expect(deferredSectionShouldMountForHash("contact", "#team")).toBe(false)
    expect(deferredSectionShouldMountForHash("about", "#news")).toBe(false)
  })

  it("ignores hashes that are not deferred sections (eager sections, empty, junk)", () => {
    expect(deferredSectionShouldMountForHash("about", "#events")).toBe(false)
    expect(deferredSectionShouldMountForHash("about", "")).toBe(false)
    expect(deferredSectionShouldMountForHash("about", "#")).toBe(false)
    expect(deferredSectionShouldMountForHash("nope", "#contact")).toBe(false)
  })

  it("accepts a hash with or without the leading '#'", () => {
    expect(deferredSectionShouldMountForHash("about", "contact")).toBe(true)
    expect(deferredSectionShouldMountForHash("about", "#contact")).toBe(true)
  })
})

interface Harness {
  options: Parameters<typeof realignHashTargetUntilStable>[1]
  runNextFrame: () => boolean
  pending: () => number
  setTop: (top: number | null) => void
  advance: (ms: number) => void
  fireUserScroll: () => void
  scrollToTarget: ReturnType<typeof vi.fn>
}

const FRAME_MS = 16

function makeHarness(overrides: Partial<{ hash: string }> = {}): Harness {
  const scheduled = new Map<number, FrameRequestCallback>()
  let nextHandle = 1
  let clock = 0
  let top: number | null = 500
  let hash = overrides.hash ?? "#contact"
  let userScrollHandler: (() => void) | null = null
  const alignedTop = 120

  const scrollToTarget = vi.fn((_id: string) => {
    // Simulate scrollIntoView({block:"start"}) honoring scroll-padding-top.
    top = alignedTop
  })

  const options = {
    getHash: () => hash,
    getTargetTop: (_id: string) => top,
    scrollToTarget,
    requestFrame: (cb: FrameRequestCallback) => {
      const handle = nextHandle++
      scheduled.set(handle, cb)
      return handle
    },
    cancelFrame: (handle: number) => {
      scheduled.delete(handle)
    },
    now: () => clock,
    addUserScrollListener: (onIntent: () => void) => {
      userScrollHandler = onIntent
      return () => {
        userScrollHandler = null
      }
    },
    stableMs: 48, // ~3 stable frames at 16ms
    tolerancePx: 1,
    maxDurationMs: 240,
  }

  return {
    options,
    runNextFrame: () => {
      const entry = [...scheduled.entries()][0]
      if (!entry) return false
      const [handle, cb] = entry
      scheduled.delete(handle)
      clock += FRAME_MS // a frame's worth of wall-clock passes before this tick
      cb(clock)
      return true
    },
    pending: () => scheduled.size,
    setTop: (value) => {
      top = value
    },
    advance: (ms) => {
      clock += ms
    },
    fireUserScroll: () => userScrollHandler?.(),
    scrollToTarget,
    setHash: (value: string) => {
      hash = value
    },
  } as Harness & { setHash: (value: string) => void }
}

function runUntilStopped(h: Harness, maxFrames = 100): void {
  for (let i = 0; i < maxFrames && h.pending() > 0; i++) h.runNextFrame()
}

describe("realignHashTargetUntilStable", () => {
  it("re-scrolls while the target drifts, then stops only after it holds still for the full window", () => {
    const h = makeHarness()
    realignHashTargetUntilStable("contact", h.options)

    // Frame 1: first alignment (top 500 -> 120).
    expect(h.runNextFrame()).toBe(true)
    expect(h.scrollToTarget).toHaveBeenCalledTimes(1)

    // A late chunk loads above the target -> it shifts down -> re-align.
    h.setTop(340)
    expect(h.runNextFrame()).toBe(true)
    expect(h.scrollToTarget).toHaveBeenCalledTimes(2)

    // It holds still and eventually settles (after the continuous stable window).
    runUntilStopped(h)
    expect(h.scrollToTarget).toHaveBeenCalledTimes(2)
    expect(h.pending()).toBe(0)
  })

  it("does NOT settle during a brief lull, then re-aligns when a late chunk shifts the target", () => {
    const h = makeHarness() // stableMs 48 => needs ~3 still frames in a row
    realignHashTargetUntilStable("contact", h.options)
    h.runNextFrame() // align #1 (top -> 120)
    // Two still frames — a lull shorter than the stable window; must NOT stop yet.
    h.runNextFrame()
    h.runNextFrame()
    expect(h.pending()).toBe(1)
    // A staggered chunk above the target now lands and shoves it down.
    h.setTop(3000)
    h.runNextFrame()
    expect(h.scrollToTarget).toHaveBeenCalledTimes(2) // re-aligned, not abandoned
    runUntilStopped(h)
    expect(h.pending()).toBe(0)
  })

  it("stops immediately once the hash no longer targets the section", () => {
    const h = makeHarness() as Harness & { setHash: (v: string) => void }
    realignHashTargetUntilStable("contact", h.options)
    h.runNextFrame() // aligns once
    h.setHash("#about") // user navigated elsewhere
    expect(h.runNextFrame()).toBe(true) // this frame detects the change and stops
    expect(h.pending()).toBe(0)
  })

  it("gives up at the hard time cap even if the layout never settles", () => {
    const h = makeHarness()
    realignHashTargetUntilStable("contact", h.options)
    for (let i = 0; i < 100 && h.pending() > 0; i++) {
      h.setTop(500 + i * 50) // never settles
      h.runNextFrame()
    }
    expect(h.pending()).toBe(0) // capped out
  })

  it("stops when the user takes over scrolling", () => {
    const h = makeHarness()
    realignHashTargetUntilStable("contact", h.options)
    h.runNextFrame()
    h.fireUserScroll()
    expect(h.pending()).toBe(0)
  })

  it("waits without scrolling while the target is not mounted yet", () => {
    const h = makeHarness()
    h.setTop(null) // placeholder not resolvable
    realignHashTargetUntilStable("contact", h.options)
    h.runNextFrame()
    expect(h.scrollToTarget).not.toHaveBeenCalled()
    expect(h.pending()).toBe(1) // still polling
    h.setTop(500) // section mounts
    h.runNextFrame()
    expect(h.scrollToTarget).toHaveBeenCalledTimes(1)
  })

  it("returns a cancel function that halts the loop and detaches listeners", () => {
    const h = makeHarness()
    const cancel = realignHashTargetUntilStable("contact", h.options)
    h.runNextFrame()
    cancel()
    expect(h.pending()).toBe(0)
    // A late user-scroll after cancel must not throw (listener detached).
    expect(() => h.fireUserScroll()).not.toThrow()
  })
})

describe("realignHashTargetUntilStable default DOM seams", () => {
  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  beforeEach(() => {
    document.body.innerHTML = ""
    if (typeof Element.prototype.scrollIntoView !== "function") {
      Element.prototype.scrollIntoView = () => {}
    }
    window.location.hash = "#contact"
    const el = document.createElement("div")
    el.id = "contact"
    document.body.appendChild(el)
  })

  afterEach(() => {
    window.location.hash = ""
    document.body.innerHTML = ""
  })

  it("runs against real window/document and settles on its own", async () => {
    const cancel = realignHashTargetUntilStable("contact")
    for (let i = 0; i < 8; i++) await nextFrame()
    // Idempotent even after it has already stopped naturally.
    expect(() => cancel()).not.toThrow()
  })

  it("stops on a real scroll-key keydown and ignores non-scroll keys", async () => {
    const cancel = realignHashTargetUntilStable("contact")
    await nextFrame()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" })) // ignored
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" })) // stops
    expect(() => cancel()).not.toThrow()
  })

  it("stops on real wheel / touchmove intent", async () => {
    realignHashTargetUntilStable("contact")
    await nextFrame()
    expect(() => {
      window.dispatchEvent(new Event("wheel"))
      window.dispatchEvent(new Event("touchmove"))
    }).not.toThrow()
  })

  it("polls without scrolling while the target element is absent", async () => {
    document.getElementById("contact")?.remove()
    const cancel = realignHashTargetUntilStable("contact")
    await nextFrame()
    cancel()
  })
})
