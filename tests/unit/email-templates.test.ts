import { describe, expect, it } from "vitest"
import { contactFormEmail } from "@/lib/email-templates"

describe("email-templates", () => {
  it("contactFormEmail includes optional company and budget rows", () => {
    const html = contactFormEmail({
      inquiryType: "Book an Event",
      name: "Jane",
      email: "jane@example.com",
      company: "The Venue",
      budget: "5k–10k",
      message: "Need sound for Sat",
    })
    expect(html).toContain("Company / Venue")
    expect(html).toContain("The Venue")
    expect(html).toContain("Budget")
    expect(html).toContain("5k–10k")
  })

  it("omits every optional row when only the required fields are given", () => {
    const html = contactFormEmail({
      inquiryType: "Book an Event",
      name: "Jane",
      email: "jane@example.com",
      message: "Need sound for Sat",
    })
    expect(html).not.toContain("Company / Venue")
    expect(html).not.toContain("Phone")
    expect(html).not.toContain("Services needed")
    expect(html).not.toContain("Estimated guests")
    expect(html).not.toContain("Budget")
    expect(html).not.toContain("When")
    expect(html).not.toContain("City")
    expect(html).not.toContain("Venue / neighborhood")
  })

  it("includes the Start Planning wizard's optional fields when present (fixed date, not flexible)", () => {
    const html = contactFormEmail({
      inquiryType: "Corporate Event",
      name: "Jane",
      email: "jane@example.com",
      message: "Need a full production",
      phone: "555-123-4567",
      services: ["Live Events", "Talent Booking"],
      guestCount: "150–400",
      eventDate: "2026-12-05",
      flexibleDate: false,
      city: "Los Angeles",
      venue: "Rooftop bar",
    })
    expect(html).toContain("Phone")
    expect(html).toContain("555-123-4567")
    expect(html).toContain("Services needed")
    expect(html).toContain("Live Events, Talent Booking")
    expect(html).toContain("Estimated guests")
    expect(html).toContain("150–400")
    expect(html).toContain("2026-12-05")
    expect(html).not.toContain("(flexible)")
    expect(html).toContain("Los Angeles")
    expect(html).toContain("Rooftop bar")
  })

  it("marks the date as flexible, or shows 'Flexible' with no date at all", () => {
    const withDate = contactFormEmail({
      inquiryType: "Corporate Event",
      name: "Jane",
      email: "jane@example.com",
      message: "hi",
      eventDate: "2026-12-05",
      flexibleDate: true,
    })
    expect(withDate).toContain("2026-12-05 (flexible)")

    const noDate = contactFormEmail({
      inquiryType: "Corporate Event",
      name: "Jane",
      email: "jane@example.com",
      message: "hi",
      flexibleDate: true,
    })
    expect(noDate).toContain("Flexible")
  })
})
