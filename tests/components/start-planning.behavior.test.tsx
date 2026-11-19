/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StartPlanning, buildBriefText } from "@/components/start-planning"

/**
 * LUPFR Website Design v5 (owner, 2026-11-17): the five-step "Start planning."
 * intake. Covers step gating, the rail, every control, submission to
 * /api/contact (payload mapping, success, HTTP failure, network failure with a
 * mailto fallback), the confirmation summary, reset, and the presetInquiry
 * event used by "Submit Your Mix".
 */

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const next = () => screen.getByRole("button", { name: /Continue|Send My Brief|Sending/ })

async function fillThroughStep4(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Yacht event" }))
  await user.click(screen.getByRole("button", { name: "SEA//SIDE" }))
  await user.click(next())
  await user.click(screen.getByRole("button", { name: /^50–150/ }))
  await user.click(screen.getByRole("button", { name: "Los Angeles" }))
  fireEvent.change(screen.getByLabelText("DATE"), { target: { value: "2027-06-12" } })
  await user.click(screen.getByRole("switch"))
  await user.click(screen.getByRole("button", { name: "Sunset" }))
  await user.type(screen.getByLabelText("VENUE (OPTIONAL)"), "Marina del Rey")
  await user.click(next())
  await user.click(screen.getByRole("button", { name: "DJs & live music" }))
  await user.click(screen.getByRole("button", { name: "Photo & video" }))
  await user.click(screen.getByRole("button", { name: "Hosts & staffing" }))
  await user.type(screen.getByLabelText("WHAT WOULD MAKE THIS A GREAT EVENT?"), "Golden hour sail")
  await user.click(next())
  await user.click(screen.getByRole("button", { name: /^\$25K–\$50K/ }))
  await user.click(screen.getByRole("button", { name: "1–3 months" }))
  await user.click(next())
}

describe("StartPlanning — structure", () => {
  it("renders the (04) INQUIRIES rail, heading, intro, five steps and the email line", () => {
    render(<StartPlanning />)
    expect(screen.getByText("(04)")).toBeInTheDocument()
    expect(screen.getByText("INQUIRIES")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Start planning.")
    expect(screen.getByText(/Tell us what you have in mind/)).toBeInTheDocument()
    const steps = within(screen.getByTestId("planning-steps")).getAllByRole("button")
    expect(steps.map((s) => s.textContent)).toEqual([
      "01OccasionIn progress",
      "02Details—",
      "03Experience—",
      "04Budget & timing—",
      "05Contact—",
    ])
    expect(screen.getByRole("link", { name: "events@lupfr.com" })).toHaveAttribute("href", "mailto:events@lupfr.com")
    expect(screen.getByText(/\/ 05/)).toBeInTheDocument()
    expect(screen.getByText("OCCASION")).toBeInTheDocument()
    expect(screen.getByTestId("start-planning")).toHaveAttribute("id", "contact")
  })

  it("offers six photo occasion tiles and the four LUPFR brands (plus Open to ideas)", () => {
    render(<StartPlanning />)
    const tiles = within(screen.getByTestId("occasion-tiles")).getAllByRole("button")
    expect(tiles.map((t) => t.textContent?.replace("✓", ""))).toEqual([
      "Private celebration",
      "Corporate event",
      "Brand activation",
      "Yacht event",
      "Venue programming",
      "Not sure yet",
    ])
    for (const s of ["SEA//SIDE", "IN//SIDE", "OUT//SIDE", "SKI//SIDE", "Open to ideas"]) {
      expect(screen.getByRole("button", { name: s })).toBeInTheDocument()
    }
  })
})

describe("StartPlanning — gating and navigation", () => {
  it("disables Continue until an occasion is picked, and toggles the pick off again", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Corporate event" }))
    expect(next()).toBeEnabled()
    await user.click(screen.getByRole("button", { name: "Corporate event" }))
    expect(next()).toBeDisabled()
  })

  it("requires guests AND city on step 2, and lets the visitor toggle each choice off", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    await user.click(screen.getByRole("button", { name: "Private celebration" }))
    await user.click(next())
    expect(screen.getByRole("heading", { level: 3, name: "The details" })).toBeInTheDocument()
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /^Under 50/ }))
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Miami" }))
    expect(next()).toBeEnabled()
    await user.click(screen.getByRole("button", { name: "Miami" }))
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Miami" }))
    await user.click(screen.getByRole("button", { name: /^Under 50/ }))
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /^Under 50/ }))
    await user.click(screen.getByRole("button", { name: "Evening" }))
    await user.click(screen.getByRole("button", { name: "Evening" }))
    expect(screen.getByRole("button", { name: "Evening" })).toHaveAttribute("aria-pressed", "false")
    await user.click(screen.getByRole("switch"))
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true")
  })

  it("accepts either a service or the vision text on step 3, and multi-selects services", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    await user.click(screen.getByRole("button", { name: "Not sure yet" }))
    await user.click(next())
    await user.click(screen.getByRole("button", { name: /^300\+/ }))
    await user.click(screen.getByRole("button", { name: "New York" }))
    await user.click(next())
    expect(screen.getByRole("heading", { level: 3, name: "The experience" })).toBeInTheDocument()
    expect(next()).toBeDisabled()
    await user.type(screen.getByLabelText("WHAT WOULD MAKE THIS A GREAT EVENT?"), "  ")
    expect(next()).toBeDisabled()
    await user.type(screen.getByLabelText("WHAT WOULD MAKE THIS A GREAT EVENT?"), "A rooftop night")
    expect(next()).toBeEnabled()
    await user.clear(screen.getByLabelText("WHAT WOULD MAKE THIS A GREAT EVENT?"))
    expect(next()).toBeDisabled()
    for (const s of ["DJs & live music", "Sound & lighting", "Venue sourcing", "Food & bar", "Decor & theme", "Branding & signage", "Transportation", "Full event management"]) {
      await user.click(screen.getByRole("button", { name: s }))
    }
    expect(next()).toBeEnabled()
    await user.click(screen.getByRole("button", { name: "Food & bar" }))
    expect(screen.getByRole("button", { name: "Food & bar" })).toHaveAttribute("aria-pressed", "false")
  })

  it("requires a budget on step 4 (guests tiles toggle, 'Not decided' counts)", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    await user.click(screen.getByRole("button", { name: "Not sure yet" }))
    await user.click(next())
    await user.click(screen.getByRole("button", { name: /^300\+/ }))
    await user.click(screen.getByRole("button", { name: "New York" }))
    await user.click(next())
    await user.click(screen.getByRole("button", { name: "Food & bar" }))
    await user.click(next())
    expect(screen.getByRole("heading", { level: 3, name: "Budget & timing" })).toBeInTheDocument()
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /^Not decided/ }))
    expect(next()).toBeEnabled()
    await user.click(screen.getByRole("button", { name: /^Not decided/ }))
    expect(next()).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Just exploring" }))
    await user.click(screen.getByRole("button", { name: "Just exploring" }))
    expect(screen.getByRole("button", { name: "Just exploring" })).toHaveAttribute("aria-pressed", "false")
  })

  it("requires a name and a valid email on step 5", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    await fillThroughStep4(user)
    expect(screen.getByRole("button", { name: "Send My Brief" })).toBeDisabled()
    await user.type(screen.getByLabelText("NAME"), "Dana Reyes")
    await user.type(screen.getByLabelText("EMAIL"), "not-an-email")
    expect(screen.getByRole("button", { name: "Send My Brief" })).toBeDisabled()
    await user.clear(screen.getByLabelText("EMAIL"))
    await user.type(screen.getByLabelText("EMAIL"), "dana@example.com")
    expect(screen.getByRole("button", { name: "Send My Brief" })).toBeEnabled()
    expect(screen.getByText(/This is an inquiry, not a booking/)).toBeInTheDocument()
  })

  it("goes back a step, and the rail only reaches steps whose predecessors are complete", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    const rail = () => within(screen.getByTestId("planning-steps")).getAllByRole("button")
    expect(rail()[2]).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Yacht event" }))
    expect(rail()[1]).toBeEnabled()
    expect(rail()[2]).toBeDisabled()
    await user.click(next())
    expect(screen.getByRole("button", { name: /BACK/ })).toBeVisible()
    await user.click(screen.getByRole("button", { name: /BACK/ }))
    expect(screen.getByRole("heading", { level: 3, name: "What's the occasion?" })).toBeInTheDocument()
    await user.click(rail()[1]!)
    expect(screen.getByRole("heading", { level: 3, name: "The details" })).toBeInTheDocument()
    expect(rail()[0]).toHaveTextContent("Yacht event")
    expect(rail()[0]).not.toHaveAttribute("aria-current")
    expect(rail()[1]).toHaveAttribute("aria-current", "step")
  })

  it("fills the gold progress bar from 4% by step", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    expect(screen.getByTestId("planning-progress")).toHaveStyle({ width: "4%" })
    await user.click(screen.getByRole("button", { name: "Yacht event" }))
    await user.click(next())
    expect(screen.getByTestId("planning-progress").style.width).toBe("24%")
  })
})

describe("StartPlanning — submission", () => {
  it("posts the mapped payload to /api/contact and shows the confirmation summary", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    render(<StartPlanning />)
    await fillThroughStep4(user)
    await user.type(screen.getByLabelText("NAME"), "Dana Reyes")
    await user.type(screen.getByLabelText("EMAIL"), "  Dana@Example.com ")
    await user.type(screen.getByLabelText("ORGANIZATION (OPTIONAL)"), "Reyes & Co")
    await user.type(screen.getByLabelText("PHONE OR INSTAGRAM (OPTIONAL)"), "@dana")
    await user.type(screen.getByLabelText("ANYTHING ELSE? (OPTIONAL)"), "Vegan menu")
    await user.click(screen.getByRole("button", { name: "Send My Brief" }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe("/api/contact")
    expect(init.method).toBe("POST")
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      inquiryType: "Yacht event",
      name: "Dana Reyes",
      email: "dana@example.com",
      company: "Reyes & Co",
      budget: "$25K–$50K",
      phone: "@dana",
      services: ["DJs & live music", "Photo & video", "Hosts & staffing"],
      guestCount: "50–150",
      eventDate: "2027-06-12",
      flexibleDate: true,
      city: "Los Angeles",
      venue: "Marina del Rey",
    })
    expect(body.message).toContain("Brand: SEA//SIDE")
    expect(body.message).toContain("Time of day: Sunset")
    expect(body.message).toContain("Vision: Golden hour sail")
    expect(body.message).toContain("Decide by: 1–3 months")
    expect(body.message).toContain("Notes: Vegan menu")

    const done = await screen.findByTestId("planning-confirmation")
    expect(within(done).getByRole("heading", { level: 3, name: "Your brief is on its way." })).toBeInTheDocument()
    expect(within(done).getByText(/Thanks, Dana\./)).toBeInTheDocument()
    expect(within(done).getByText("OCCASION")).toBeInTheDocument()
    expect(within(done).getByText("Yacht event · SEA//SIDE")).toBeInTheDocument()
    expect(within(done).getByText(/50–150 guests · Los Angeles · Jun 12, 2027 \(flexible\)/)).toBeInTheDocument()
    expect(within(done).getByText("DJs & live music, Photo & video +1")).toBeInTheDocument()
    expect(within(done).getByText("$25K–$50K · 1–3 months")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Continue|Send My Brief/ })).toBeNull()
  })

  it("sends only the fields the visitor filled in, with the minimum message", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    render(<StartPlanning />)
    await user.click(screen.getByRole("button", { name: "Not sure yet" }))
    await user.click(next())
    await user.click(screen.getByRole("button", { name: /^300\+/ }))
    await user.click(screen.getByRole("button", { name: "Somewhere else" }))
    await user.click(screen.getByRole("switch"))
    await user.click(next())
    await user.type(screen.getByLabelText("WHAT WOULD MAKE THIS A GREAT EVENT?"), "Surprise me")
    await user.click(next())
    await user.click(screen.getByRole("button", { name: /^Not decided/ }))
    await user.click(next())
    await user.type(screen.getByLabelText("NAME"), "Sam")
    await user.type(screen.getByLabelText("EMAIL"), "sam@example.com")
    await user.click(screen.getByRole("button", { name: "Send My Brief" }))
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body)
    expect(body.company).toBeUndefined()
    expect(body.phone).toBeUndefined()
    expect(body.services).toBeUndefined()
    expect(body.eventDate).toBeUndefined()
    expect(body.venue).toBeUndefined()
    expect(body.flexibleDate).toBe(true)
    const done = await screen.findByTestId("planning-confirmation")
    expect(within(done).getByText(/Thanks, Sam\./)).toBeInTheDocument()
    expect(within(done).getByText("Vision noted")).toBeInTheDocument()
    expect(within(done).getByText(/300\+ guests · Somewhere else · Flexible/)).toBeInTheDocument()
  })

  it("shows an inline error with a mailto fallback when the API refuses, and lets the visitor retry", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValueOnce({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    render(<StartPlanning />)
    await fillThroughStep4(user)
    await user.type(screen.getByLabelText("NAME"), "Dana Reyes")
    await user.type(screen.getByLabelText("EMAIL"), "dana@example.com")
    await user.click(screen.getByRole("button", { name: "Send My Brief" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("We couldn't send your brief just now.")
    const mailto = within(alert).getByRole("link", { name: "events@lupfr.com" })
    expect(mailto.getAttribute("href")).toMatch(/^mailto:events@lupfr\.com\?subject=Event%20inquiry%3A%20Yacht%20event&body=/)
    expect(decodeURIComponent(mailto.getAttribute("href")!)).toContain("Name: Dana Reyes")
    expect(screen.queryByTestId("planning-confirmation")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Send My Brief" }))
    expect(await screen.findByTestId("planning-confirmation")).toBeInTheDocument()
  })

  it("treats a network error the same way", async () => {
    const user = userEvent.setup()
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
    render(<StartPlanning />)
    await fillThroughStep4(user)
    await user.type(screen.getByLabelText("NAME"), "Dana Reyes")
    await user.type(screen.getByLabelText("EMAIL"), "dana@example.com")
    await user.click(screen.getByRole("button", { name: "Send My Brief" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't send")
  })

  it("ignores a second submit while the first is still sending, and 'Start another brief' resets everything", async () => {
    const user = userEvent.setup()
    let resolveFetch: (v: { ok: boolean }) => void = () => {}
    const fetchMock = vi.fn().mockReturnValue(new Promise((r) => (resolveFetch = r)))
    vi.stubGlobal("fetch", fetchMock)
    render(<StartPlanning />)
    await fillThroughStep4(user)
    await user.type(screen.getByLabelText("NAME"), "Dana Reyes")
    await user.type(screen.getByLabelText("EMAIL"), "dana@example.com")
    await user.click(screen.getByRole("button", { name: "Send My Brief" }))
    expect(screen.getByRole("button", { name: /Sending/ })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /Sending/ }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => resolveFetch({ ok: true }))
    await user.click(await screen.findByRole("button", { name: "START ANOTHER BRIEF" }))
    expect(screen.getByRole("heading", { level: 3, name: "What's the occasion?" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Yacht event" })).toHaveAttribute("aria-pressed", "false")
    expect(next()).toBeDisabled()
  })
})

describe("StartPlanning — presetInquiry event (Submit Your Mix)", () => {
  it("selects 'Not sure yet', pre-fills the notes and returns to step 1", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    await user.click(screen.getByRole("button", { name: "Corporate event" }))
    await user.click(next())
    act(() => {
      window.dispatchEvent(new CustomEvent("presetInquiry", { detail: "Submit Your Mix" }))
    })
    expect(screen.getByRole("heading", { level: 3, name: "What's the occasion?" })).toBeInTheDocument()
    // An existing pick is kept; only an empty occasion defaults to "Not sure yet".
    expect(screen.getByRole("button", { name: "Corporate event" })).toHaveAttribute("aria-pressed", "true")
  })

  it("defaults the occasion when none is picked, appends to existing notes and tolerates an empty detail", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    act(() => {
      window.dispatchEvent(new CustomEvent("presetInquiry", { detail: "Submit Your Mix" }))
    })
    expect(screen.getByRole("button", { name: "Not sure yet" })).toHaveAttribute("aria-pressed", "true")
    act(() => {
      window.dispatchEvent(new CustomEvent("presetInquiry", { detail: "Second ask" }))
      window.dispatchEvent(new CustomEvent("presetInquiry"))
    })
    // Jump to step 5 to read the notes back.
    await user.click(next())
    await user.click(screen.getByRole("button", { name: /^50–150/ }))
    await user.click(screen.getByRole("button", { name: "Los Angeles" }))
    await user.click(next())
    await user.click(screen.getByRole("button", { name: "Food & bar" }))
    await user.click(next())
    await user.click(screen.getByRole("button", { name: /^Not decided/ }))
    await user.click(next())
    expect((screen.getByLabelText("ANYTHING ELSE? (OPTIONAL)") as HTMLTextAreaElement).value).toBe("Interested in: Submit Your Mix\nInterested in: Second ask")
  })
})

describe("buildBriefText", () => {
  it("prints dashes for everything the visitor left blank", () => {
    const text = buildBriefText({
      occasion: null,
      brands: [],
      guests: null,
      city: null,
      date: "",
      flexible: false,
      time: null,
      venue: "",
      services: [],
      vision: "",
      budget: null,
      decide: null,
      name: "",
      email: "",
      company: "",
      phone: "",
      notes: "",
    })
    expect(text.split("\n").every((line) => line.endsWith(": -"))).toBe(true)
  })
})

describe("StartPlanning — brand row and one-screen layout (owner 2026-11-19)", () => {
  it("lets the visitor pick several brands, including SKI//SIDE, and sends them in the brief", async () => {
    const user = userEvent.setup()
    render(<StartPlanning />)
    await user.click(screen.getByRole("button", { name: "Yacht event" }))
    await user.click(screen.getByRole("button", { name: "SKI//SIDE" }))
    await user.click(screen.getByRole("button", { name: "OUT//SIDE" }))
    expect(screen.getByRole("button", { name: "SKI//SIDE" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "OUT//SIDE" }))
    expect(screen.getByRole("button", { name: "OUT//SIDE" })).toHaveAttribute("aria-pressed", "false")
    const blank = { occasion: null, brands: [], guests: null, city: null, date: "", flexible: false, time: null, venue: "", services: [], vision: "", budget: null, decide: null, name: "", email: "", company: "", phone: "", notes: "" }
    const text = buildBriefText({ ...blank, occasion: "Yacht event", brands: ["SKI//SIDE", "SEA//SIDE"] })
    expect(text).toContain("Brand: SKI//SIDE, SEA//SIDE")
  })

  it("fills the screen (min-h 100dvh), keeps 16:9 occasion tiles, and pins Continue to the bottom of the card", () => {
    render(<StartPlanning />)
    expect(screen.getByTestId("start-planning").className).toContain("min-h-[100dvh]")
    for (const tile of within(screen.getByTestId("occasion-tiles")).getAllByRole("button")) {
      expect(tile.className).toContain("aspect-[16/9]")
    }
    expect(screen.getByTestId("planning-nav").className).toContain("sticky")
    expect(screen.getByTestId("planning-nav").className).toContain("bottom-0")
  })
})
