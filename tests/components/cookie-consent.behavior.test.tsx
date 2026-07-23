/** @vitest-environment happy-dom */

import type { ReactNode } from "react"
import { act } from "react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CookieConsent } from "@/components/cookie-consent"
import { LUPFR_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent"

const COOKIE_NOTICE_DELAY_MS = 4500

/** Next `Link` → anchor for DOM behavior assertions (user-visible navigation targets). */
vi.mock("next/link", () => ({
  default({
    children,
    href,
    prefetch: _prefetch,
    ...rest
  }: {
    children: ReactNode
    href: string
    className?: string
    prefetch?: boolean
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  },
}))

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    // happy-dom ignores `document.cookie = ""` — expire the consent cookie explicitly.
    document.cookie = "lupfr_cookie_consent=; Max-Age=0; Path=/"
  })

  it("shows the cookie notice for a new visitor and removes it after Accept", async () => {
    const user = userEvent.setup()
    vi.useFakeTimers()
    render(<CookieConsent />)

    await showCookieNotice()

    const region = await waitFor(() =>
      screen.getByRole("region", { name: "Cookie notice" })
    )
    expect(region).toBeVisible()
    expect(screen.getByRole("heading", { name: /privacy.*cookies/i })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Accept" }))

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "Cookie notice" })
      ).not.toBeInTheDocument()
    })
    expect(localStorage.getItem(LUPFR_CONSENT_STORAGE_KEY)).toBe("accepted")
  })

  it("does not show the notice when consent is already stored", async () => {
    localStorage.setItem(LUPFR_CONSENT_STORAGE_KEY, "accepted")
    render(<CookieConsent />)

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "Cookie notice" })
      ).not.toBeInTheDocument()
    })
  })

  it("offers privacy and terms links before accepting", async () => {
    vi.useFakeTimers()
    render(<CookieConsent />)

    await showCookieNotice()

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
        "href",
        "/privacy"
      )
    })
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
  })
})

async function showCookieNotice(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(COOKIE_NOTICE_DELAY_MS + 50)
  })
  vi.useRealTimers()
}
