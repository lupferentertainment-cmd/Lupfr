/** @vitest-environment happy-dom */

import { describe, it, expect, vi, beforeAll } from "vitest"
import { render, screen } from "@testing-library/react"
import { Team } from "@/components/team"

/** Next `Image` → plain img; the founder cards only need src/alt semantics. */
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
    // Owner supplied a new outdoor portrait for Will on 2026-08-29 (the old
    // will.webp stays on disk for an easy revert).
    expect(srcs).toContain("/images/team/will-2026.webp")
    // Owner supplied a higher-resolution portrait for Eliott on 2026-09-02
    // (the old eliott-square.webp turned out to be a downsized crop; see
    // data/team.yml's doc comment).
    expect(srcs).toContain("/images/team/eliott-2026.webp")
  })

  it("adapts to a third founder without a code change", async () => {
    vi.resetModules()
    const member = (name: string) => ({
      name,
      title: "Co-Founder",
      location: "Los Angeles, CA",
      teams: ["LA"],
      badges: ["LA"],
      bio: `${name} bio.`,
      founder: true,
      image: `/images/team/${name.toLowerCase()}.webp`,
    })
    vi.doMock("@/lib/data/team", () => ({
      getFounders: () => [member("Alpha"), member("Beta"), member("Gamma")],
    }))
    const { Team: T } = await import("@/components/team")
    render(<T />)
    const founders = screen.getByRole("region", { name: /founders/i })
    for (const n of ["Alpha", "Beta", "Gamma"]) expect(founders.textContent).toContain(n)
    vi.doUnmock("@/lib/data/team")
    vi.resetModules()
  })
})

describe("Team — founder layout matches the design file's split layout (owner punch list, 2026-08-29)", () => {
  it("renders each founder as a portrait + copy pair, not a bordered card", () => {
    render(<Team />)
    const founders = foundersRegion()
    // One CSS grid holds every founder's two elements as direct children —
    // no per-founder wrapper card, no click-to-expand affordance.
    const grid = founders.querySelector(":scope > div.grid")
    expect(grid).not.toBeNull()
    // 2 founders × (portrait + copy) = 4 direct grid children.
    expect(grid!.children).toHaveLength(4)
    // No click-to-expand buttons inside the founders region — the roster grid
    // that used to sit below (with its own toggle buttons) is gone (owner
    // punch list, 2026-09-02: Zac/Kylie/Cianna removed, founders-only now).
    expect(founders.querySelectorAll("button")).toHaveLength(0)
  })

  it("splits each founder's name into an outlined first name and a solid-accent last name", () => {
    render(<Team />)
    const founders = foundersRegion()
    const willHeading = Array.from(founders.querySelectorAll("h3")).find((h) =>
      h.textContent?.includes("Will")
    )
    expect(willHeading).toBeTruthy()
    const spans = willHeading!.querySelectorAll("span")
    expect(Array.from(spans).some((s) => s.textContent === "Will")).toBe(true)
    expect(Array.from(spans).some((s) => s.textContent === "Lupfer")).toBe(true)
    expect(willHeading!.textContent).toContain("Will Lupfer")
  })

  it("shows a role · location divider line for each founder", () => {
    render(<Team />)
    const founders = foundersRegion()
    expect(founders.textContent).toContain("CEO & Founder")
    expect(founders.textContent).toContain("Los Angeles & San Francisco")
  })
})

describe("Team — founder quote/stats (owner restructure, 2026-08-28)", () => {
  it("splits a multi-paragraph founder bio into separate paragraphs", () => {
    render(<Team />)
    const founders = foundersRegion()
    const paragraphs = Array.from(founders.querySelectorAll("p")).map((p) => p.textContent?.trim())
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
    }))
    const { Team: T } = await import("@/components/team")
    const { container } = render(<T />)
    expect(container.querySelector("blockquote")).toBeNull()
    vi.doUnmock("@/lib/data/team")
    vi.resetModules()
  })
})

describe("Team — roster removed (owner punch list, 2026-09-02)", () => {
  it("renders no filter boxes and no roster grid now that founders are the only members", () => {
    render(<Team />)
    expect(screen.queryByRole("group", { name: /filter team/i })).toBeNull()
    expect(screen.queryByRole("button", { name: /Show .* team/i })).toBeNull()
    expect(screen.queryByText("Zac Brosky")).toBeNull()
    expect(screen.queryByText("Kylie Cortez")).toBeNull()
    expect(screen.queryByText("Cianna Foppoli")).toBeNull()
  })

  it("renders 'The Founders' as the section heading instead of 'Our Team'", () => {
    render(<Team />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The Founders")
    expect(screen.queryByText("Our Team")).toBeNull()
  })
})
