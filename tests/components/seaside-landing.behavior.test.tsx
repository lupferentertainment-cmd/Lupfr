/** @vitest-environment happy-dom */

import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SeasideLanding } from "@/components/seaside/seaside-landing"

/** Next `Image` → plain img; the seaside page only needs src/alt semantics. */
vi.mock("next/image", () => ({
  default({ src, alt, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string }) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...img } = rest as Record<string, unknown>
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...img} />
  },
}))

beforeAll(() => {
  // framer-motion whileInView needs IntersectionObserver; happy-dom lacks it.
  if (typeof globalThis.IntersectionObserver === "undefined") {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    } as unknown as typeof IntersectionObserver
  }
})

describe("SeasideLanding — motion + mobile regression locks", () => {
  it("hero h1 keeps SEA // SIDE as real text despite the per-word stagger reveal", () => {
    render(<SeasideLanding />)
    const h1 = document.querySelector("h1")
    expect(h1).not.toBeNull()
    // AnimatedText must render words as text nodes joined by spaces —
    // screen readers and crawlers read the headline as plain text.
    expect(h1!.textContent?.replace(/\s+/g, " ").trim()).toBe("SEA // SIDE")
  })

  it("scoped CSS ships the perpetual hero zoom with a reduced-motion opt-out", () => {
    render(<SeasideLanding />)
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n")
    // Ken-Burns breathe: visible range, slow, perpetual, compositor-friendly.
    expect(css).toContain("scale(1.22)")
    expect(css).toMatch(/ss-kb 34s [^;]*infinite alternate/)
    expect(css).toContain("will-change: transform")
    // The zoom must be disabled for prefers-reduced-motion users.
    const reducedBlock = css.split("prefers-reduced-motion")[1] ?? ""
    expect(reducedBlock).toContain("animation: none")
  })

  it("all three partner marks sit in uniform, top-anchored logo slots", () => {
    render(<SeasideLanding />)
    const slots = document.querySelectorAll(".ss-partner-logo")
    expect(slots.length).toBe(3)
    // Uniform slot height comes from one shared CSS rule.
    const css = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n")
    expect(css).toMatch(/\.ss-partner-logo\s*\{[^}]*height:\s*52px/)
    // Cards must be top-anchored (gap flow), not space-between — bottom-anchored
    // content of different heights pushed the logos off one shared baseline.
    const cards = document.querySelectorAll<HTMLElement>(".ss-partner-card")
    expect(cards.length).toBe(3)
    for (const card of cards) {
      expect(card.style.justifyContent).not.toBe("space-between")
      expect(card.style.gap).not.toBe("")
    }
  })

  it("mobile nav ships a burger toggle that opens the menu with nav links", async () => {
    const user = userEvent.setup()
    render(<SeasideLanding />)
    // happy-dom renders at desktop width where CSS hides the burger, which
    // strips its accessible name — assert the wiring via attributes instead.
    const burger = document.querySelector<HTMLButtonElement>("button.ss-nav-burger")
    expect(burger).not.toBeNull()
    expect(burger).toHaveAttribute("aria-label", "Open menu")
    expect(burger).toHaveAttribute("aria-expanded", "false")
    await user.click(burger!)
    expect(burger).toHaveAttribute("aria-label", "Close menu")
    expect(burger).toHaveAttribute("aria-expanded", "true")
    // Dropdown carries the section links (anchor navigation must survive redesigns).
    const menu = document.getElementById("ss-nav-menu")
    expect(menu).not.toBeNull()
    const menuLinks = menu!.querySelectorAll("a[href^='#']")
    expect(menuLinks.length).toBeGreaterThanOrEqual(5)
  })
})
