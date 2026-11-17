/**
 * Scroll-flicker regression guard.
 *
 * Root cause: components using `useInView({ once: false })` and directly
 * wiring `isInView` → `animate` (opacity) caused sections to fade out when
 * scrolled past and flash back in on return.  The fix:
 *   - services / contact / footer: `once: true`   (animate in once, stay)
 *   - about: keep `once: false` for count-up replay, but gate opacity
 *     animations on a `hasRevealed` latch so the portrait/text never disappear
 *
 * These tests catch any regression that re-introduces the flickering pattern.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8")

const services = read("components/services.tsx")
const startPlanning = read("components/start-planning.tsx")
const footer = read("components/footer.tsx")
const about = read("components/about.tsx")

// ── services ──────────────────────────────────────────────────────────────────

describe("services scroll-flicker guard", () => {
  it("useInView uses once:true so cards never animate back to opacity-0 on scroll-past", () => {
    expect(services).toContain("useInView(ref, { once: true,")
  })

  it("does not use once:false for the section-level observer", () => {
    expect(services).not.toMatch(/useInView\(ref,\s*\{\s*once:\s*false/)
  })
})

// ── start planning ────────────────────────────────────────────────────────────

describe("start planning scroll-flicker guard", () => {
  // v5 (2026-11-17): the old Contact wizard's scroll-linked fade (and its
  // portaled sticky bar observer) are gone. The intake has no in-view
  // observer at all, so nothing can fade back out on scroll-past; its mobile
  // Back/Continue bar is plain CSS `sticky`.
  it("has no in-view observer that could fade the form out", () => {
    expect(startPlanning).not.toMatch(/useInView|IntersectionObserver/)
  })
})

// ── footer ────────────────────────────────────────────────────────────────────

describe("footer scroll-flicker guard", () => {
  it("useInView uses once:true so footer links never fade out", () => {
    expect(footer).toContain("useInView(ref, { once: true,")
  })

  it("does not use once:false for the section-level observer", () => {
    expect(footer).not.toMatch(/useInView\(ref,\s*\{\s*once:\s*false/)
  })
})

// ── about ─────────────────────────────────────────────────────────────────────

describe("about scroll-flicker guard", () => {
  it("uses hasRevealed latch so portrait and text never animate back to opacity-0", () => {
    expect(about).toContain("hasRevealed")
    expect(about).toContain("setHasRevealed")
  })

  it("gates the left-column container opacity on hasRevealed, not raw isInView", () => {
    expect(about).toContain("animate={hasRevealed ? { opacity: 1, x: 0 } : {}}")
  })

  it("keeps once:false on isInView so CountUpOrdinal replays on scroll-back", () => {
    expect(about).toMatch(/useInView\(ref,\s*\{\s*once:\s*false/)
  })

  it("the hasRevealed latch is set inside a useEffect that watches isInView", () => {
    expect(about).toContain("setHasRevealed(true)")
    expect(about).toContain("if (!isInView) return")
    expect(about).toContain("[isInView]")
  })

})

// ── events uses the latch pattern (already correct) ───────────────────────────
// (the home gallery carousel + album sections are retired to _deprecated/)

describe("events uses the hasRevealed latch pattern (no regression)", () => {
  const events = read("components/events.tsx")

  it("events uses hasRevealed latch", () => {
    expect(events).toContain("hasRevealed")
    expect(events).toContain("setHasRevealed(true)")
  })
})
