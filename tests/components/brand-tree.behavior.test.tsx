/** @vitest-environment happy-dom */

/**
 * Corporate-structure tree (owner restructure, 2026-08-28) — LUPFR at top,
 * two groups below: LIVE / EVENTS (SEA//SIDE, IN//SIDE, OUT//SIDE) and
 * CORPORATE · MEDIA / PROGRAMMING (HIGH//RISE, SOUND//CHECK), each brand
 * tappable to jump to its own detail row (`#brand-<key>`) further down
 * app/brands/page.tsx.
 */
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { BrandTree } from "@/components/brand-tree"
import { getBrands } from "@/lib/data/brands"

const brands = getBrands()

describe("BrandTree", () => {
  it("renders the LUPFR node and exactly one tree button per brand", () => {
    render(<BrandTree brands={brands} />)
    expect(screen.getByText("LUPFR")).toBeInTheDocument()
    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(brands.length)
  })

  it("groups SEA//SIDE, IN//SIDE, OUT//SIDE under Live / Events", () => {
    render(<BrandTree brands={brands} />)
    const liveGroup = screen.getByText(/Live/).closest("div")
    expect(liveGroup?.textContent).toContain("SEA")
    expect(liveGroup?.textContent).toContain("IN")
    expect(liveGroup?.textContent).toContain("OUT")
  })

  it("groups HIGH//RISE, SOUND//CHECK under Corporate · Media / Programming, both marked Soon", () => {
    render(<BrandTree brands={brands} />)
    const corpGroup = screen.getByText(/Corporate · Media/).closest("div")
    expect(corpGroup?.textContent).toContain("HIGH")
    expect(corpGroup?.textContent).toContain("SOUND")
    expect(screen.getAllByText("Soon")).toHaveLength(2)
  })

  it("clicking a node scrolls its #brand-<key> section into view", () => {
    const scrollIntoView = vi.fn()
    const target = document.createElement("div")
    target.id = "brand-seaside"
    target.scrollIntoView = scrollIntoView
    document.body.appendChild(target)

    render(<BrandTree brands={brands} />)
    const node = screen.getByRole("button", { name: /Jump to SEA SIDE/i })
    node.click()
    expect(scrollIntoView).toHaveBeenCalled()

    document.body.removeChild(target)
  })
})
