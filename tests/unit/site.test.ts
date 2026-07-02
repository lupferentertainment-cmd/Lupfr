import { describe, expect, it } from "vitest"
import { CONTACT_PAGE_PATH, SEASIDE_HOST, SEASIDE_URL } from "@/lib/site"

describe("site constants", () => {
  it("Book an Event and contact page use /contact", () => {
    expect(CONTACT_PAGE_PATH).toBe("/contact")
  })

  it("SEA//SIDE microsite host is seaside.lupfr.com", () => {
    expect(SEASIDE_HOST).toBe("seaside.lupfr.com")
  })

  it("SEA//SIDE URL derives from the seaside host", () => {
    expect(SEASIDE_URL).toBe("https://seaside.lupfr.com")
  })
})
