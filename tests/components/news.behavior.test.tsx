/** @vitest-environment happy-dom */

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { News } from "@/components/news"
import { getNews } from "@/lib/data/news"

/**
 * Home-page News strip: a vertical scrolling carousel (owner request
 * 2026-09-02: "make it a scrolling carousel - just on home page not sub
 * page", then corrected the same day to scroll top-to-bottom rather than
 * side-to-side — confirmed via a clarifying question), not the /media
 * page's own static feed. Every real news item shows here, including the
 * BAL MASQUÉ item (which briefly had showOnMedia: false before the owner
 * reversed that the same day too).
 */
describe("News", () => {
  it("renders the #news section with every news item as a safe external link", () => {
    const { container } = render(<News />)
    const section = container.querySelector("section#news")
    expect(section).not.toBeNull()

    const news = getNews()
    expect(news.length).toBeGreaterThan(0)
    for (const item of news) {
      const link = container.querySelector(`a[href="${item.url}"]`)
      expect(link, `link for "${item.title}"`).not.toBeNull()
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    }
  })

  it("includes the BAL MASQUÉ item", () => {
    render(<News />)
    expect(screen.getByText(/Bal Masqué sells out/i)).toBeInTheDocument()
  })

  it("renders every item as its own top-to-bottom row (list item), not side-by-side cards", () => {
    const { container } = render(<News />)
    const list = container.querySelector("ul")
    expect(list).not.toBeNull()
    expect(list?.children.length).toBe(getNews().length)
    expect(Array.from(list?.children ?? []).every((el) => el.tagName === "LI")).toBe(true)
  })

  it("links 'News & media' to the Media Hub", () => {
    render(<News />)
    expect(screen.getByRole("link", { name: /News & media/i })).toHaveAttribute("href", "/media")
  })

  it("scrolls the list up/down via the prev/next arrows (native vertical scroll-snap carousel)", async () => {
    const scrollBy = vi.fn()
    // happy-dom doesn't implement scrollBy; stub it to assert direction/behavior.
    Element.prototype.scrollBy = scrollBy as unknown as typeof Element.prototype.scrollBy
    const user = userEvent.setup()
    render(<News />)

    await user.click(screen.getByRole("button", { name: /scroll to next news/i }))
    expect(scrollBy).toHaveBeenCalledTimes(1)
    const nextArg = scrollBy.mock.calls[0][0] as { top: number; behavior: string }
    expect(nextArg.top).toBeGreaterThan(0)
    expect(nextArg.behavior).toBe("smooth")

    await user.click(screen.getByRole("button", { name: /scroll to previous news/i }))
    expect(scrollBy).toHaveBeenCalledTimes(2)
    const prevArg = scrollBy.mock.calls[1][0] as { top: number; behavior: string }
    expect(prevArg.top).toBeLessThan(0)
  })
})
