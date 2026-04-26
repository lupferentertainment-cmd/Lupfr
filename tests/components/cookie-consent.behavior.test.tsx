/** @vitest-environment happy-dom */

import type { ReactNode } from "react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CookieConsent } from "@/components/cookie-consent"
import { LUPFR_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent"

/** Next `Link` → anchor for DOM behavior assertions (user-visible navigation targets). */
vi.mock("next/link", () => ({
  default({
    children,
    href,
    ...rest
  }: {
    children: ReactNode
    href: string
    className?: string
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
    localStorage.clear()
    document.cookie = ""
  })

  it("shows the cookie notice for a new visitor and removes it after Accept", async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)

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
    render(<CookieConsent />)

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
        "href",
        "/privacy"
      )
    })
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
  })
})
