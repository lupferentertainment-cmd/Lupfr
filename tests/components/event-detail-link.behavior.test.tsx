/** @vitest-environment happy-dom */

import type { AnchorHTMLAttributes, ReactNode } from "react"
import { describe, expect, it, beforeEach, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { EventDetailLink } from "@/components/event-detail-link"

const prefetch = vi.fn()

vi.mock("next/navigation", () => ({
    useRouter: () => ({ prefetch }),
}))

vi.mock("next/link", () => ({
    default({
        children,
        href,
        prefetch: _prefetch,
        ...rest
    }: AnchorHTMLAttributes<HTMLAnchorElement> & {
        children: ReactNode
        href: string
        prefetch?: boolean
    }) {
        return (
            <a href={href} {...rest}>
                {children}
            </a>
        )
    },
}))

describe("EventDetailLink", () => {
    beforeEach(() => {
        prefetch.mockClear()
    })

    it("keeps the event card as a normal link to the canonical detail page", () => {
        render(<EventDetailLink slug="shamrock-house">Shamrock & House</EventDetailLink>)

        expect(screen.getByRole("link", { name: "Shamrock & House" })).toHaveAttribute(
            "href",
            "/events/shamrock-house"
        )
    })

    it("warms the route once when a visitor shows intent before tapping", () => {
        render(<EventDetailLink slug="shamrock-house">Shamrock & House</EventDetailLink>)
        const link = screen.getByRole("link", { name: "Shamrock & House" })

        fireEvent.focus(link)
        fireEvent.pointerEnter(link)

        expect(prefetch).toHaveBeenCalledTimes(1)
        expect(prefetch).toHaveBeenCalledWith("/events/shamrock-house")
    })

    it("gives immediate feedback on mobile activation without duplicating prefetches", () => {
        render(<EventDetailLink slug="shamrock-house">Shamrock & House</EventDetailLink>)
        const link = screen.getByRole("link", { name: "Shamrock & House" })

        fireEvent.touchStart(link)
        fireEvent.pointerDown(link)
        fireEvent.click(link)

        expect(link).toHaveAttribute("data-pending", "true")
        expect(prefetch).toHaveBeenCalledTimes(1)
        expect(prefetch).toHaveBeenCalledWith("/events/shamrock-house")
    })

    it("clears mobile tap feedback when activation is cancelled", () => {
        render(<EventDetailLink slug="shamrock-house">Shamrock & House</EventDetailLink>)
        const link = screen.getByRole("link", { name: "Shamrock & House" })

        fireEvent.pointerDown(link)
        expect(link).toHaveAttribute("data-pending", "true")

        fireEvent.pointerCancel(link)
        expect(link).toHaveAttribute("data-pending", "false")
    })
})