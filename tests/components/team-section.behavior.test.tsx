/** @vitest-environment happy-dom */

import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Team } from "@/components/team"

/** Next `Image` → plain img; the team cards only need src/alt semantics. */
vi.mock("next/image", () => ({
  default({ src, alt, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string }) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...img } = rest as Record<string, unknown>
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...img} />
  },
}))

beforeAll(() => {
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

function visibleNames(): string[] {
  // Only roster-card h3s: those sit inside the click-to-expand button. Founder
  // cards and the Partiful band heading are excluded by design.
  return screen
    .getAllByRole("heading", { level: 3 })
    .filter((h) => h.closest("button") !== null)
    .map((h) => h.textContent?.trim() ?? "")
}

function foundersRegion(): HTMLElement {
  return screen.getByRole("region", { name: /founders/i })
}

describe("Team — founders row (owner request 2026-08-04)", () => {
  it("renders Will and Eliott in a dedicated founders region", () => {
    render(<Team />)
    const founders = foundersRegion()
    expect(founders.textContent).toContain("Will Lupfer")
    expect(founders.textContent).toContain("Eliott")
    expect(founders.textContent).toContain("Co-Founder")
  })

  it("shows founder bios inline — 'larger images / description below', not click-to-expand", () => {
    render(<Team />)
    const founders = foundersRegion()
    expect(founders.textContent).toMatch(/Will founded LUPFR/)
    // Eliott's bio became the owner's design-file copy on 2026-08-08.
    expect(founders.textContent).toMatch(/co-founder of LUPFR/)
    // No expand toggle inside a founder card.
    expect(founders.querySelectorAll("[aria-expanded]")).toHaveLength(0)
  })

  it("renders both founder portraits", () => {
    render(<Team />)
    const founders = foundersRegion()
    const srcs = Array.from(founders.querySelectorAll("img")).map((i) => i.getAttribute("src"))
    expect(srcs).toContain("/images/team/will.webp")
    // Owner supplied a square portrait for Eliott on 2026-08-08.
    expect(srcs).toContain("/images/team/eliott-square.webp")
  })

  it("places the founders row above the filtered roster grid", () => {
    const { container } = render(<Team />)
    const founders = foundersRegion()
    const grid = container.querySelector("[data-team-grid]")
    expect(grid).not.toBeNull()
    // DOCUMENT_POSITION_FOLLOWING === founders comes first in document order.
    expect(founders.compareDocumentPosition(grid!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("keeps founders out of the roster grid so they are not rendered twice", () => {
    render(<Team />)
    const names = visibleNames()
    expect(names.some((n) => n.includes("Will Lupfer"))).toBe(false)
    expect(names.some((n) => n.includes("Eliott"))).toBe(false)
  })

  it("adapts to a third founder without a code change", async () => {
    vi.resetModules()
    const member = (name: string, founder: boolean) => ({
      name,
      title: founder ? "Co-Founder" : "Intern",
      location: "Los Angeles, CA",
      teams: ["LA"],
      badges: ["LA"],
      bio: `${name} bio.`,
      founder,
      image: `/images/team/${name.toLowerCase()}.webp`,
    })
    vi.doMock("@/lib/data/team", () => ({
      TEAM_TAGS: ["LA", "SF", "Exec"],
      getFounders: () => [member("Alpha", true), member("Beta", true), member("Gamma", true)],
      getRoster: () => [member("Delta", false)],
    }))
    const { Team: T } = await import("@/components/team")
    render(<T />)
    const founders = screen.getByRole("region", { name: /founders/i })
    for (const n of ["Alpha", "Beta", "Gamma"]) expect(founders.textContent).toContain(n)
    vi.doUnmock("@/lib/data/team")
    vi.resetModules()
  })
})

describe("Team — founder quote/stats (owner restructure, 2026-08-28)", () => {
  it("splits a multi-paragraph founder bio into separate paragraphs", () => {
    render(<Team />)
    const founders = foundersRegion()
    const paragraphs = Array.from(founders.querySelectorAll("p")).map((p) => p.textContent?.trim())
    // Will's bio ships as 2 paragraphs on data/team.yml pending owner-supplied
    // replacement copy for the dropped paragraph — see data/team.yml comment.
    expect(paragraphs.some((t) => t?.startsWith("Will founded LUPFR Entertainment"))).toBe(true)
    expect(paragraphs.some((t) => t?.includes("B2 Authentic LLC"))).toBe(true)
  })

  it("renders each founder's pull quote", () => {
    render(<Team />)
    const founders = foundersRegion()
    expect(founders.textContent).toContain("今を生きる")
    expect(founders.textContent).toContain("The best way to predict the future is to invent it.")
  })

  it("renders each founder's stat callouts", () => {
    render(<Team />)
    const founders = foundersRegion()
    expect(founders.textContent).toContain("20+")
    expect(founders.textContent).toContain("EVENTS PRODUCED")
    expect(founders.textContent).toContain("ESQ.")
    expect(founders.textContent).toContain("LICENSED ATTORNEY")
  })

  it("omits the quote/stats blocks for a founder without them", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/team", () => ({
      TEAM_TAGS: ["LA", "SF", "Exec"],
      getFounders: () => [
        {
          name: "No Quote Founder",
          title: "Co-Founder",
          location: "Los Angeles, CA",
          teams: ["Exec"],
          badges: ["Exec"],
          bio: "A single-paragraph bio with no quote or stats.",
          founder: true,
          image: "/images/team/no-quote.webp",
        },
      ],
      getRoster: () => [],
    }))
    const { Team: T } = await import("@/components/team")
    const { container } = render(<T />)
    expect(container.querySelector("blockquote")).toBeNull()
    vi.doUnmock("@/lib/data/team")
    vi.resetModules()
  })
})

describe("Team — LA / SF filter boxes", () => {
  it("renders a filter box only for tags that have roster members", () => {
    render(<Team />)
    for (const label of ["All", "LA", "SF"]) {
      expect(screen.getByRole("button", { name: `Show ${label} team` })).toBeInTheDocument()
    }
    // Exec is founders-only now, so an Exec filter would show an empty grid.
    expect(screen.queryByRole("button", { name: "Show Exec team" })).toBeNull()
  })

  it("shows every roster member by default", () => {
    render(<Team />)
    const names = visibleNames()
    expect(names.some((n) => n.includes("Zac"))).toBe(true)
    expect(names.some((n) => n.includes("Kylie"))).toBe(true)
    expect(names.some((n) => n.includes("Cianna"))).toBe(true)
  })

  it("renders a badge per team tag on a roster card (phase 25, ported from the comp)", () => {
    render(<Team />)
    const heading = screen
      .getAllByRole("heading", { level: 3 })
      .find((h) => h.textContent?.includes("Cianna"))
    expect(heading).toBeDefined()
    const card = heading!.closest("button")
    expect(card).not.toBeNull()
    for (const tag of ["LA", "SF"]) {
      expect(card!.textContent).toContain(tag)
    }
  })

  it("LA shows Zac, Kylie, and Cianna (no Will)", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show LA team" }))
    const names = visibleNames()
    expect(names.some((n) => n.includes("Zac"))).toBe(true)
    expect(names.some((n) => n.includes("Kylie"))).toBe(true)
    expect(names.some((n) => n.includes("Cianna"))).toBe(true)
    expect(names.some((n) => n.includes("Will"))).toBe(false)
  })

  it("SF shows Cianna", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show SF team" }))
    const names = visibleNames()
    expect(names.some((n) => n.includes("Cianna"))).toBe(true)
    expect(names.some((n) => n.includes("Will"))).toBe(false)
    expect(names.some((n) => n.includes("Zac"))).toBe(false)
    expect(names.some((n) => n.includes("Kylie"))).toBe(false)
  })

  it("marks the active filter with aria-pressed", async () => {
    const user = userEvent.setup()
    render(<Team />)
    const la = screen.getByRole("button", { name: "Show LA team" })
    expect(la).toHaveAttribute("aria-pressed", "false")
    await user.click(la)
    expect(la).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Show All team" })).toHaveAttribute("aria-pressed", "false")
  })

  it("lays out the team in a centered fit-all row, 2-up on phones (owner request 2026-07-08)", () => {
    const { container } = render(<Team />)
    // flex-wrap + justify-center: all members visible, no manual horizontal scroll,
    // sparse filters center instead of a stranded bottom-right grid gap.
    const row = container.querySelector("[data-team-grid]")
    expect(row).not.toBeNull()
    expect(row?.className).not.toContain("grid-cols-4")
    // phones are 2-up via a 50%-basis wrapper on each card.
    const firstItem = row?.firstElementChild
    expect(firstItem?.className).toContain("basis-[calc(50%-0.375rem)]")
  })

  it("tapping a roster card toggles the expandable bio open and closed", async () => {
    const user = userEvent.setup()
    render(<Team />)
    const card = screen.getByRole("button", { name: /Zac Brosky/ })
    expect(card).toHaveAttribute("aria-expanded", "false")
    await user.click(card)
    expect(card).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region", { name: /Zac Brosky/ })).toHaveTextContent(
      /Loyola Marymount/
    )
    await user.click(card)
    expect(card).toHaveAttribute("aria-expanded", "false")
  })

  it("every member renders a portrait (Cianna's arrived 2026-07-06)", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show SF team" }))
    expect(screen.getByAltText(/Cianna/)).toBeInTheDocument()
    expect(screen.queryByText("Portrait coming soon")).toBeNull()
  })

  it("a member without an image still renders the 'Portrait coming soon' placeholder", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/team", () => ({
      TEAM_TAGS: ["LA", "SF", "Exec"],
      getFounders: () => [],
      getRoster: () => [
        {
          name: "Pending Portrait",
          title: "New Hire",
          location: "San Francisco, CA",
          teams: ["SF"],
          badges: ["SF"],
          bio: "Bio pending.",
          founder: false,
        },
      ],
    }))
    const { Team: TeamWithPendingMember } = await import("@/components/team")
    render(<TeamWithPendingMember />)
    expect(screen.getByText("Portrait coming soon")).toBeInTheDocument()
    expect(screen.queryByAltText(/Pending Portrait/)).toBeNull()
    vi.doUnmock("@/lib/data/team")
    vi.resetModules()
  })
})
