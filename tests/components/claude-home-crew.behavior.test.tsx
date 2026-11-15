/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ClaudeHomeCrew } from "@/components/claude-home-crew"
import { getCrewEntries } from "@/lib/data/crew"

/**
 * Round 12 (owner handoff "LUPFR Website Design v15", 2026-11-15): render/
 * interaction contracts for Our Team — the Exec Team tiles, the five dashed
 * group frames, and the 14-person bio pop-up.
 */

vi.mock("next/image", () => ({
  default({ src, alt, fill: _fill, sizes: _sizes, priority: _priority, ...rest }: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={String(alt ?? "")} {...(rest as object)} />
  },
}))

afterEach(() => {
  document.body.style.overflow = ""
})

const BIO = (name: string, role: string) => `Read full bio: ${name}, ${role}`

describe("ClaudeHomeCrew section", () => {
  it("is the #team section, with the Our Team heading", () => {
    const { container } = render(<ClaudeHomeCrew />)
    expect(container.querySelector("section#team")).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Our Team")
  })

  it("opens with the Exec Team: two large tiles for Will and Eliott", () => {
    render(<ClaudeHomeCrew />)
    const frame = screen.getByTestId("crew-exec-frame")
    expect(frame).toHaveAttribute("aria-label", "EXEC TEAM")
    expect(within(frame).getByText("LEADERSHIP · STRATEGY · VISION")).toBeInTheDocument()
    const tiles = within(frame).getAllByTestId("crew-exec-tile")
    expect(tiles).toHaveLength(2)
    expect(within(tiles[0]).getByText("Will")).toBeInTheDocument()
    expect(within(tiles[0]).getByText("Lupfer")).toBeInTheDocument()
    expect(within(tiles[0]).getByText("Founder & CEO")).toBeInTheDocument()
    expect(within(tiles[1]).getByText("Nazarian")).toBeInTheDocument()
    // Exec tiles carry LinkedIn + Instagram only (no website), as the v15 list says.
    expect(within(tiles[0]).getByLabelText("Will Lupfer on LinkedIn")).toBeInTheDocument()
    expect(within(tiles[1]).getByLabelText("Eliott Nazarian on Instagram")).toBeInTheDocument()
    expect(within(tiles[0]).queryByLabelText("Will Lupfer website")).not.toBeInTheDocument()
  })

  it("renders the 5 dashed groups in order, each with its header and sub-line, and 12 tiles", () => {
    render(<ClaudeHomeCrew />)
    const groups = screen.getAllByTestId("crew-group")
    expect(groups.map((g) => g.getAttribute("aria-label"))).toEqual([
      "OPERATIONS",
      "BUSINESS DEVELOPMENT",
      "MEDIA TEAM",
      "LEGAL TEAM",
      "ADVISORS",
    ])
    for (const group of groups) expect(group.className).toContain("border-dashed")
    expect(within(groups[0]).getByText("PRODUCTION · LOGISTICS · EXECUTION")).toBeInTheDocument()
    expect(within(groups[4]).getByText("STRATEGY · OPERATIONS · HOSPITALITY")).toBeInTheDocument()
    expect(screen.getAllByTestId("crew-tile")).toHaveLength(12)
    expect(within(groups[2]).getAllByTestId("crew-tile")).toHaveLength(2)
    expect(within(groups[3]).getAllByTestId("crew-tile")).toHaveLength(1)
  })

  it("has no gold pill labels or numbers on the group frames any more", () => {
    render(<ClaudeHomeCrew />)
    for (const group of screen.getAllByTestId("crew-group")) {
      expect(group.className).not.toContain("rounded-lg")
      expect(group.querySelector(".bg-\\[\\#c9a869\\]")).toBeNull()
    }
  })

  it("shows the short line on each tile (not the full bio) and no pop-up by default", () => {
    render(<ClaudeHomeCrew />)
    const [, , opsWill] = getCrewEntries()
    expect(screen.getByText(opsWill.short)).toBeInTheDocument()
    expect(screen.queryByText(opsWill.bio)).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renders each social/website button only when that URL exists", () => {
    render(<ClaudeHomeCrew />)
    // Link Studios: Instagram only. Robbie: Instagram only. Nikita: all three. FredEx: website only.
    expect(screen.queryByLabelText("Link Studios on LinkedIn")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Link Studios on Instagram")).toHaveAttribute(
      "href",
      "https://www.instagram.com/xlancesanchez/"
    )
    expect(screen.getByLabelText("Nikita Khandheria on LinkedIn")).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/nikitakhandheria/"
    )
    expect(screen.getByLabelText("Nikita Khandheria website")).toHaveAttribute("href", "https://eria.co")
    expect(screen.getByLabelText("Robbie Cullerton on Instagram")).toBeInTheDocument()
    expect(screen.queryByLabelText("Robbie Cullerton on LinkedIn")).not.toBeInTheDocument()
    expect(screen.getByLabelText("FredEx Entertainment website")).toHaveAttribute("href", "https://fredexentertainment.com")
    expect(screen.queryByLabelText("FredEx Entertainment on LinkedIn")).not.toBeInTheDocument()
    expect(screen.getByLabelText("Cube World website")).toHaveAttribute("href", "https://cubeworldproductions.com")
  })

  it("clicking a social link does not open the pop-up", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeCrew />)
    for (const label of ["Aliyah Hyman on LinkedIn", "Will Lupfer on LinkedIn"]) {
      const link = screen.getAllByLabelText(label)[0]
      link.addEventListener("click", (e) => e.preventDefault())
      await user.click(link)
    }
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("ClaudeHomeCrew bio pop-up", () => {
  async function openMember(label: string) {
    const user = userEvent.setup()
    render(<ClaudeHomeCrew />)
    await user.click(screen.getByRole("button", { name: label }))
    return user
  }

  it("opens with the full bio, group, role and position counter", async () => {
    await openMember(BIO("Nikita Khandheria", "Advisor · Founder & CEO, ERIA"))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByRole("heading", { level: 3 })).toHaveTextContent("Nikita Khandheria")
    expect(within(dialog).getByText("ADVISORS")).toBeInTheDocument()
    expect(within(dialog).getByText(/Advisor · Founder & CEO, ERIA/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/seasoned entrepreneur/)).toBeInTheDocument()
    expect(within(dialog).getByRole("link", { name: /ERIA\.CO/ })).toHaveAttribute("href", "https://eria.co")
    expect(screen.getByTestId("crew-position")).toHaveTextContent("13 / 14")
    expect(document.body.style.overflow).toBe("hidden")
  })

  it("opens an Exec tile with every founder paragraph, as separate paragraphs", async () => {
    await openMember(BIO("Will Lupfer", "Founder & CEO"))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByText("EXEC TEAM")).toBeInTheDocument()
    expect(screen.getByTestId("crew-position")).toHaveTextContent("01 / 14")
    expect(within(dialog).getByText(/Raised in Oregon/)).toBeInTheDocument()
    expect(within(dialog).getByText(/B2 Authentic LLC/)).toBeInTheDocument()
    expect(dialog.querySelectorAll(".flex-col.gap-3\\.5 > p")).toHaveLength(5)
  })

  it("steps through all 14 people in display order and loops at both ends", async () => {
    const user = await openMember(BIO("Will Lupfer", "Founder & CEO"))
    expect(screen.getByTestId("crew-position")).toHaveTextContent("01 / 14")
    await user.click(screen.getByRole("button", { name: "Previous team member" }))
    expect(screen.getByTestId("crew-position")).toHaveTextContent("14 / 14")
    expect(within(screen.getByRole("dialog")).getByRole("heading", { level: 3 })).toHaveTextContent("Kamilla Zakirzianova")
    await user.click(screen.getByRole("button", { name: "Next team member" }))
    expect(screen.getByTestId("crew-position")).toHaveTextContent("01 / 14")
    await user.click(screen.getByRole("button", { name: "Next team member" }))
    expect(within(screen.getByRole("dialog")).getByRole("heading", { level: 3 })).toHaveTextContent("Eliott Nazarian")
  })

  it("arrow keys navigate and Escape closes, restoring scroll and focus", async () => {
    await openMember(BIO("Cube World", "Production Partner"))
    const trigger = screen.getByRole("button", { name: BIO("Cube World", "Production Partner") })
    const modal = screen.getByTestId("crew-modal")
    fireEvent.keyDown(modal, { key: "ArrowRight" })
    expect(screen.getByTestId("crew-position")).toHaveTextContent("06 / 14")
    fireEvent.keyDown(modal, { key: "ArrowLeft" })
    expect(screen.getByTestId("crew-position")).toHaveTextContent("05 / 14")
    fireEvent.keyDown(modal, { key: "Escape" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe("")
    expect(document.activeElement).toBe(trigger)
  })

  it("closes from the × button and from the backdrop, but not from clicks inside the card", async () => {
    const label = BIO("Eliott Nazarian", "Legal Counsel · Nazarian Law")
    const user = await openMember(label)
    await user.click(screen.getByRole("dialog"))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: label }))
    await user.click(screen.getByTestId("crew-modal"))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("traps Tab focus inside the dialog", async () => {
    await openMember(BIO("Link Studios", "Media Partner · SEA//SIDE"))
    const modal = screen.getByTestId("crew-modal")
    const dialog = screen.getByRole("dialog")
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    last.focus()
    fireEvent.keyDown(modal, { key: "Tab" })
    expect(document.activeElement).toBe(first)
    first.focus()
    fireEvent.keyDown(modal, { key: "Tab", shiftKey: true })
    expect(document.activeElement).toBe(last)
    // A plain Tab in the middle is left to the browser.
    focusables[1]?.focus()
    fireEvent.keyDown(modal, { key: "Tab" })
    expect(document.activeElement).toBe(focusables[1])
  })

  it("fades and makes the bio keyboard-scrollable only when it actually overflows", async () => {
    const proto = HTMLElement.prototype
    const scrollHeight = Object.getOwnPropertyDescriptor(proto, "scrollHeight")
    const clientHeight = Object.getOwnPropertyDescriptor(proto, "clientHeight")
    Object.defineProperty(proto, "scrollHeight", { configurable: true, get: () => 600 })
    Object.defineProperty(proto, "clientHeight", { configurable: true, get: () => 260 })
    try {
      await openMember(BIO("Mike Lupfer", "Advisor"))
      const bio = within(screen.getByRole("dialog")).getByText(/original Lupfer brand-builder/).parentElement!
      expect(bio).toHaveAttribute("tabindex", "0")
      expect(bio.className).toContain("calc(100%-40px)")
    } finally {
      if (scrollHeight) Object.defineProperty(proto, "scrollHeight", scrollHeight)
      else delete (proto as unknown as Record<string, unknown>).scrollHeight
      if (clientHeight) Object.defineProperty(proto, "clientHeight", clientHeight)
      else delete (proto as unknown as Record<string, unknown>).clientHeight
    }
  })

  it("leaves a short bio un-faded and out of the tab order", async () => {
    await openMember(BIO("Cube World", "Production Partner"))
    const bio = within(screen.getByRole("dialog")).getByText(/production partner in Los Angeles/).parentElement!
    expect(bio).not.toHaveAttribute("tabindex")
    expect(bio.className).not.toContain("calc(100%-40px)")
  })

  it("shows only the website pill for a member whose single link is a website", async () => {
    await openMember(BIO("FredEx Entertainment", "Production Partner"))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByRole("link", { name: /FREDEXENTERTAINMENT\.COM/ })).toHaveAttribute(
      "href",
      "https://fredexentertainment.com"
    )
    expect(within(dialog).queryByLabelText("FredEx Entertainment on LinkedIn")).not.toBeInTheDocument()
    expect(within(dialog).queryByLabelText("FredEx Entertainment on Instagram")).not.toBeInTheDocument()
  })

  it("shows the LinkedIn/Instagram buttons but no website pill when there's no business site", async () => {
    await openMember(BIO("Eliott Nazarian", "Co-Founder, General Counsel"))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByLabelText("Eliott Nazarian on LinkedIn")).toBeInTheDocument()
    expect(within(dialog).getByLabelText("Eliott Nazarian on Instagram")).toBeInTheDocument()
    expect(within(dialog).queryByRole("link", { name: /↗/ })).not.toBeInTheDocument()
  })
})
