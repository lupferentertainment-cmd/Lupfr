import { describe, expect, it } from "vitest"
import { CONTACT_PAGE_PATH } from "@/lib/site"

describe("site constants", () => {
  it("Book an Event and contact page use /contact", () => {
    expect(CONTACT_PAGE_PATH).toBe("/contact")
  })
})
