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
  return screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent?.trim() ?? "")
}

describe("Team — LA / SF / Exec filter boxes", () => {
  it("renders the All / LA / SF / Exec filter controls", () => {
    render(<Team />)
    for (const label of ["All", "LA", "SF", "Exec"]) {
      expect(screen.getByRole("button", { name: `Show ${label} team` })).toBeInTheDocument()
    }
  })

  it("shows every member (including Cianna) by default", () => {
    render(<Team />)
    const names = visibleNames()
    expect(names.some((n) => n.includes("Will Lupfer"))).toBe(true)
    expect(names.some((n) => n.includes("Zac"))).toBe(true)
    expect(names.some((n) => n.includes("Kylie"))).toBe(true)
    expect(names.some((n) => n.includes("Mateen"))).toBe(true)
    expect(names.some((n) => n.includes("Cianna"))).toBe(true)
  })

  it("Exec shows only Will", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show Exec team" }))
    const names = visibleNames()
    expect(names).toHaveLength(1)
    expect(names[0]).toContain("Will Lupfer")
  })

  it("LA shows Zac, Kylie, and Cianna (no Will, no Mateen)", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show LA team" }))
    const names = visibleNames()
    expect(names.some((n) => n.includes("Zac"))).toBe(true)
    expect(names.some((n) => n.includes("Kylie"))).toBe(true)
    expect(names.some((n) => n.includes("Cianna"))).toBe(true)
    expect(names.some((n) => n.includes("Will"))).toBe(false)
    expect(names.some((n) => n.includes("Mateen"))).toBe(false)
  })

  it("SF shows Mateen and Cianna", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show SF team" }))
    const names = visibleNames()
    expect(names.some((n) => n.includes("Mateen"))).toBe(true)
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

  it("uses a 2-up grid on phones (grid-cols-2 base)", () => {
    const { container } = render(<Team />)
    const grid = container.querySelector(".grid")
    expect(grid?.className).toContain("grid-cols-2")
    expect(grid?.className).not.toContain("grid-cols-1")
  })

  it("tapping a card toggles the expandable bio open and closed", async () => {
    const user = userEvent.setup()
    render(<Team />)
    const willCard = screen.getByRole("button", { name: /Will Lupfer/ })
    expect(willCard).toHaveAttribute("aria-expanded", "false")
    await user.click(willCard)
    expect(willCard).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region")).toHaveTextContent(/Will founded LUPFR/)
    await user.click(willCard)
    expect(willCard).toHaveAttribute("aria-expanded", "false")
  })

  it("Cianna renders a placeholder (no portrait yet), other members render their portraits", async () => {
    const user = userEvent.setup()
    render(<Team />)
    await user.click(screen.getByRole("button", { name: "Show SF team" }))
    expect(screen.getByAltText(/Mateen/)).toBeInTheDocument()
    expect(screen.queryByAltText(/Cianna/)).toBeNull()
    expect(screen.getByText("Portrait coming soon")).toBeInTheDocument()
  })
})
