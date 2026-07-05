/** @vitest-environment happy-dom */

import { describe, it, expect, vi, beforeAll, afterEach } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
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

describe("SeasideLanding — access/partner modal + editions/lineup interactions", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubFetch(ok: boolean) {
    const fetchMock = vi.fn().mockResolvedValue({ ok })
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
  }

  async function openAccessModal(user: ReturnType<typeof userEvent.setup>) {
    const openers = screen.getAllByRole("button", { name: "Request Access" })
    await user.click(openers[0])
    return screen.getByRole("dialog", { name: "Request Access" })
  }

  it("Request Access opens the access modal; a successful submit posts to /api/phone-list and confirms", async () => {
    const fetchMock = stubFetch(true)
    const user = userEvent.setup()
    render(<SeasideLanding />)
    const dialog = await openAccessModal(user)
    await user.type(screen.getByLabelText("Full name"), "Test Guest")
    await user.type(screen.getByLabelText("Email address"), "guest@example.com")
    await user.type(screen.getByLabelText("Instagram handle"), "@guest")
    await user.click(within(dialog).getByRole("button", { name: "Request Access" }))
    await waitFor(() => expect(screen.getByText("Request received.")).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/phone-list",
      expect.objectContaining({ method: "POST" })
    )
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { name: string; email: string }
    expect(body.email).toBe("guest@example.com")
    expect(body.name).toContain("Test Guest")
  })

  it("a failed submit surfaces the retry error and keeps the form", async () => {
    stubFetch(false)
    const user = userEvent.setup()
    render(<SeasideLanding />)
    const dialog = await openAccessModal(user)
    await user.type(screen.getByLabelText("Full name"), "Test Guest")
    await user.type(screen.getByLabelText("Email address"), "guest@example.com")
    await user.click(within(dialog).getByRole("button", { name: "Request Access" }))
    await waitFor(() =>
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument()
    )
    expect(screen.queryByText("Request received.")).toBeNull()
  })

  it("footer Partner CTA opens the partner variant; Close and Escape both dismiss", async () => {
    const user = userEvent.setup()
    render(<SeasideLanding />)
    await user.click(screen.getByRole("button", { name: /Partner With Us/i }))
    expect(screen.getByRole("dialog", { name: "Partner With Us" })).toBeInTheDocument()
    expect(screen.getByLabelText("Company / brand")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close" }))
    // AnimatePresence exit: the dialog leaves the DOM after the fade completes.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    // Re-open and dismiss with Escape (the modal owns the key while open).
    await user.click(screen.getByRole("button", { name: /Partner With Us/i }))
    expect(screen.getByRole("dialog", { name: "Partner With Us" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("edition carousel next/prev and dots swap the active edition", async () => {
    const user = userEvent.setup()
    render(<SeasideLanding />)
    // The active edition owns the panel image alt `<headline> — <num>`.
    expect(screen.getAllByAltText(/— 001/).length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: "Next edition" }))
    await waitFor(() => expect(screen.getAllByAltText(/— 002/).length).toBeGreaterThan(0))
    await user.click(screen.getByRole("button", { name: "Previous edition" }))
    await waitFor(() => expect(screen.getAllByAltText(/— 001/).length).toBeGreaterThan(0))
    await user.click(screen.getByRole("button", { name: "Go to edition 2" }))
    await waitFor(() => expect(screen.getAllByAltText(/— 002/).length).toBeGreaterThan(0))
  })

  it("selecting an edition spec row swaps the panel image", async () => {
    const user = userEvent.setup()
    render(<SeasideLanding />)
    const locationRow = screen.getAllByRole("button", { name: /Location/i })[0]
    await user.click(locationRow)
    await waitFor(() => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"))
      expect(imgs.some((img) => img.src.includes("keys-skyline"))).toBe(true)
    })
  })

  it("clicking a mobile menu link closes the dropdown", async () => {
    const user = userEvent.setup()
    render(<SeasideLanding />)
    const burger = document.querySelector<HTMLButtonElement>("button.ss-nav-burger")!
    await user.click(burger)
    const menu = document.getElementById("ss-nav-menu")!
    const firstLink = menu.querySelector<HTMLAnchorElement>("a[href^='#']")!
    await user.click(firstLink)
    await waitFor(() => expect(burger).toHaveAttribute("aria-expanded", "false"))
  })

  it("selecting a lineup artist swaps the featured profile", async () => {
    const user = userEvent.setup()
    render(<SeasideLanding />)
    // Default profile is HLWA; Auguste's profile copy is unique to his card.
    expect(screen.queryByText(/French \/ Martiniquan/)).toBeNull()
    await user.click(screen.getAllByRole("button", { name: /Auguste/i })[0])
    await waitFor(() => expect(screen.getByText(/French \/ Martiniquan/)).toBeInTheDocument())
  })
})
