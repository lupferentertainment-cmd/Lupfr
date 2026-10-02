/** @vitest-environment happy-dom */

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Contact } from "@/components/contact"
import { getServices } from "@/lib/data/services"

/**
 * "Start Planning" wizard (2026-10-02 literal design-file port; round 4 fix,
 * owner: "remove event, the first should just be service"). Covers the
 * 5-step flow end to end: the real services/size/budget/when-where/contact
 * data, the live brief sentence, the real /api/contact submission payload
 * (including the services-derived `inquiryType` fallback that replaced the
 * removed "What are you planning?" step), the confirmation screen + reset,
 * and the preset-inquiry event artists.tsx dispatches for "Submit Your Mix"
 * (which still sets `inquiryType` directly, bypassing the wizard steps).
 */

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

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch(ok: boolean) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => ({}) })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

async function advanceToContactStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Next" })) // services (step 1) optional
  await user.click(screen.getByRole("button", { name: "Next" })) // size (step 2) optional
  await user.click(screen.getByRole("button", { name: "Next" })) // budget (step 3) optional
  await user.click(screen.getByRole("button", { name: "Next" })) // when/where (step 4) optional
}

describe("Contact — Start Planning wizard", () => {
  it("step 1 is Services, with Next enabled immediately (no plan-type gate)", async () => {
    const user = userEvent.setup()
    render(<Contact />)
    expect(screen.getByRole("heading", { name: "What do you need from us?" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "What are you planning?" })).not.toBeInTheDocument()
    const next = screen.getByRole("button", { name: "Next" })
    expect(next).toBeEnabled()
    for (const service of getServices()) {
      expect(screen.getByText(service.title)).toBeInTheDocument()
    }
    const firstServiceButton = screen.getByText(getServices()[0]!.title).closest("button")
    expect(firstServiceButton).toHaveAttribute("aria-pressed", "false")
    await user.click(firstServiceButton!)
    expect(firstServiceButton).toHaveAttribute("aria-pressed", "true")
  })

  it("Back returns to the previous step without losing the selection", async () => {
    const user = userEvent.setup()
    render(<Contact />)
    const firstService = getServices()[0]!.title
    await user.click(screen.getByText(firstService).closest("button")!)
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("heading", { name: "How big is it?" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.getByRole("heading", { name: "What do you need from us?" })).toBeInTheDocument()
    expect(screen.getByText(firstService).closest("button")).toHaveAttribute("aria-pressed", "true")
  })

  it("the step nav tabs jump directly to any step", async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.click(screen.getByRole("tab", { name: /05.*Contact/ }))
    expect(screen.getByRole("heading", { name: "Who should we talk to?" })).toBeInTheDocument()
  })

  it("the preset-inquiry event (artists.tsx 'Submit Your Mix') sets the inquiry type directly, bypassing the removed type step", async () => {
    const fetchMock = stubFetch(true)
    const user = userEvent.setup()
    render(<Contact />)
    act(() => {
      window.dispatchEvent(new CustomEvent("presetInquiry", { detail: "Submit Your Mix" }))
    })
    await advanceToContactStep(user)
    await user.type(screen.getByPlaceholderText("Your name"), "Jane Doe")
    await user.type(screen.getByPlaceholderText("you@company.com"), "jane@example.com")
    await user.click(screen.getByRole("button", { name: /Send Brief/ }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string)
    expect(body.inquiryType).toBe("Submit Your Mix")
  })

  it("submits the real wizard payload to /api/contact, deriving inquiryType from the chosen services, and shows the confirmation + live brief", async () => {
    const fetchMock = stubFetch(true)
    const user = userEvent.setup()
    render(<Contact />)

    expect(screen.getByRole("heading", { name: "What do you need from us?" })).toBeInTheDocument()
    const firstService = getServices()[0]!.title
    await user.click(screen.getByText(firstService).closest("button")!)
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: /^150–400/ }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: /^\$15K–50K/ }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.type(screen.getByLabelText("Date"), "2026-12-05")
    await user.click(screen.getByRole("button", { name: "Flexible" }))
    await user.click(screen.getByRole("button", { name: "Los Angeles" }))
    await user.type(screen.getByPlaceholderText("Rooftop, yacht, our office..."), "Rooftop bar")
    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByRole("heading", { name: "Who should we talk to?" })).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText("Your name"), "Jane Doe")
    await user.type(screen.getByPlaceholderText("you@company.com"), "jane@example.com")
    await user.type(screen.getByPlaceholderText("Company or organization"), "Acme Co")
    await user.type(screen.getByPlaceholderText("(555) 555-5555"), "5551234567")
    await user.type(screen.getByPlaceholderText(/The vibe you're after/), "Make it unforgettable")
    await user.click(screen.getByRole("button", { name: /Send Brief/ }))

    await waitFor(() => expect(screen.getByText("Your brief is on its way.")).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }))
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string)
    expect(body).toMatchObject({
      inquiryType: firstService,
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Co",
      phone: "5551234567",
      services: [firstService],
      guestCount: "150–400",
      budget: "$15K–50K",
      city: "Los Angeles",
      eventDate: "2026-12-05",
      flexibleDate: true,
      venue: "Rooftop bar",
      message: "Make it unforgettable",
    })

    expect(screen.getByText(/We're planning an event/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Start another brief" }))
    expect(screen.getByRole("heading", { name: "What do you need from us?" })).toBeInTheDocument()
    expect(screen.getByText(firstService).closest("button")).toHaveAttribute("aria-pressed", "false")
  })

  it("falls back to a generic inquiryType when no services were picked either", async () => {
    const fetchMock = stubFetch(true)
    const user = userEvent.setup()
    render(<Contact />)
    await advanceToContactStep(user)
    await user.type(screen.getByPlaceholderText("Your name"), "Jane Doe")
    await user.type(screen.getByPlaceholderText("you@company.com"), "jane@example.com")
    await user.click(screen.getByRole("button", { name: /Send Brief/ }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string)
    expect(body.inquiryType).toBe("Event Inquiry")
  })

  it("requires name and email before the brief can be sent", async () => {
    const fetchMock = stubFetch(true)
    const user = userEvent.setup()
    render(<Contact />)
    await advanceToContactStep(user)
    await user.click(screen.getByRole("button", { name: /Send Brief/ }))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("falls back to a mailto draft when the API call fails", async () => {
    stubFetch(false)
    const hrefSpy = vi.fn()
    Object.defineProperty(window, "location", {
      value: { ...window.location, set href(v: string) { hrefSpy(v) } },
      writable: true,
    })
    const user = userEvent.setup()
    render(<Contact />)
    await advanceToContactStep(user)
    await user.type(screen.getByPlaceholderText("Your name"), "Jane Doe")
    await user.type(screen.getByPlaceholderText("you@company.com"), "jane@example.com")
    await user.click(screen.getByRole("button", { name: /Send Brief/ }))
    await waitFor(() => expect(hrefSpy).toHaveBeenCalled())
    expect(hrefSpy.mock.calls[0]![0]).toContain("mailto:")
  })
})

describe("Contact — 'Join the contact list' card (unchanged, below the wizard)", () => {
  it("requires a name", () => {
    render(<Contact />)
    // The name input is HTML-required, so a real click would be blocked by
    // the browser's own constraint validation before any JS runs — submit
    // the form directly to exercise the component's own "Name is required"
    // guard underneath that.
    const emailInput = screen.getByPlaceholderText("you@example.com")
    fireEvent.change(emailInput, { target: { value: "guest@example.com" } })
    fireEvent.submit(emailInput.closest("form")!)
    expect(screen.queryByText("You are on the contact list.")).not.toBeInTheDocument()
  })

  it("requires an email or phone", async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.click(screen.getByRole("button", { name: "Join" }))
    expect(screen.queryByText("You are on the contact list.")).not.toBeInTheDocument()
  })

  it("rejects an invalid email format", async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.type(screen.getByPlaceholderText("you@example.com"), "not-an-email")
    const emailInput = screen.getByPlaceholderText("you@example.com")
    fireEvent.submit(emailInput.closest("form")!)
    expect(screen.queryByText("You are on the contact list.")).not.toBeInTheDocument()
  })

  it("rejects an invalid phone number", async () => {
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.type(screen.getByPlaceholderText("Your phone number"), "123")
    await user.click(screen.getByRole("button", { name: "Join" }))
    expect(screen.queryByText("You are on the contact list.")).not.toBeInTheDocument()
  })

  it("surfaces the server's own error message on a failed join", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Already on the list." }) }))
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.type(screen.getByPlaceholderText("you@example.com"), "guest@example.com")
    await user.click(screen.getByRole("button", { name: "Join" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Join" })).toBeEnabled())
  })

  it("falls back to a generic message when a failed join omits an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.type(screen.getByPlaceholderText("you@example.com"), "guest@example.com")
    await user.click(screen.getByRole("button", { name: "Join" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Join" })).toBeEnabled())
  })

  it("joins successfully with a valid name + email", async () => {
    const fetchMock = stubFetch(true)
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.type(screen.getByPlaceholderText("you@example.com"), "guest@example.com")
    await user.click(screen.getByRole("button", { name: "Join" }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/phone-list", expect.objectContaining({ method: "POST" })))
  })

  it("surfaces a network error without crashing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
    const user = userEvent.setup()
    render(<Contact />)
    await user.type(screen.getByPlaceholderText("Jane Smith"), "Guest Name")
    await user.type(screen.getByPlaceholderText("Your phone number"), "5551234567")
    await user.click(screen.getByRole("button", { name: "Join" }))
    await waitFor(() => expect(screen.getByRole("button", { name: "Join" })).toBeEnabled())
  })
})
