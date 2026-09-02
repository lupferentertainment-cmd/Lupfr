/** @vitest-environment happy-dom */

import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"

/**
 * News strip edge cases with a mocked data source — separate file so the
 * mock only applies here, not to news.behavior.test.tsx's real-data tests.
 */
describe("News — edge cases", () => {
  it("renders nothing when there is no news", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/news", () => ({
      getNews: () => [],
      newsDateLabel: () => "",
    }))
    const { News } = await import("@/components/news")
    const { container } = render(<News />)
    expect(container.firstChild).toBeNull()
    vi.doUnmock("@/lib/data/news")
  })

  it("hides the prev/next arrows when there's only one item to scroll", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/news", () => ({
      getNews: () => [{ id: 1, source: "X", dateISO: "2026-01-01", title: "Only item", url: "https://example.com/x" }],
      newsDateLabel: () => "JAN 1, 2026",
    }))
    const { News } = await import("@/components/news")
    const { queryByRole } = render(<News />)
    expect(queryByRole("button", { name: /scroll to next news/i })).toBeNull()
    expect(queryByRole("button", { name: /scroll to previous news/i })).toBeNull()
    vi.doUnmock("@/lib/data/news")
  })
})
