/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"

const suspendedByIndex: Record<string, boolean> = {}
vi.mock("@/components/lazy-loop-video", () => ({
  LazyLoopVideo: ({ srcMp4, suspended }: { srcMp4: string; suspended?: boolean }) => {
    suspendedByIndex[srcMp4] = Boolean(suspended)
    return <video data-testid="video" data-suspended={String(Boolean(suspended))} data-src={srcMp4} />
  },
}))

import { ClaudeHomeExperiences } from "@/components/claude-home-experiences"

/**
 * Stack cards pin on top of each other, so a card that the next one has slid over is still
 * "on screen" but invisible. Its video must be suspended so only the visible clip decodes.
 */
describe("Featured Experiences covered-card video suspension", () => {
  afterEach(() => vi.restoreAllMocks())

  function mockTops(tops: number[]) {
    const cards = screen.getAllByTestId("experience-card")
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const i = cards.indexOf(this)
      const top = i >= 0 ? tops[i]! : 0
      return { top, bottom: top + 600, left: 0, right: 0, width: 0, height: 600, x: 0, y: top, toJSON: () => ({}) }
    })
  }

  async function scrollFrame() {
    await act(async () => {
      window.dispatchEvent(new Event("scroll"))
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
  }

  it("suspends a card's video once the next card has covered it, and resumes when it uncovers", async () => {
    render(<ClaudeHomeExperiences />)
    const cards = screen.getAllByTestId("experience-card")
    const suspended = () => cards.map((c) => c.querySelector("video")?.getAttribute("data-suspended"))

    // Card 2 is far below card 1: nothing covered.
    mockTops([92, 700, 1400])
    await scrollFrame()
    expect(suspended().filter((v) => v === "true")).toHaveLength(0)

    // Card 2 slides in over card 1 (16px stack step): card 1 is covered, the last card never is.
    mockTops([92, 108, 124])
    await scrollFrame()
    expect(suspended()[0]).toBe("true")
    expect(suspended()[cards.length - 1]).not.toBe("true")

    // Scrolling back up uncovers it again.
    mockTops([92, 700, 1400])
    await scrollFrame()
    expect(suspended().filter((v) => v === "true")).toHaveLength(0)
  })

  it("coalesces rapid scroll/resize events into one measure and cleans up on unmount", async () => {
    const { unmount } = render(<ClaudeHomeExperiences />)
    mockTops([92, 108, 124])
    const raf = vi.spyOn(window, "requestAnimationFrame")
    const caf = vi.spyOn(window, "cancelAnimationFrame")
    act(() => {
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("scroll"))
      window.dispatchEvent(new Event("resize"))
    })
    expect(raf).toHaveBeenCalledTimes(1)
    unmount()
    expect(caf).toHaveBeenCalledTimes(1)
  })
})
