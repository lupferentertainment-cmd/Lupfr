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
})
