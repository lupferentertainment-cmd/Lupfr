import { describe, expect, it } from "vitest"
import { CONTACT_PAGE_PATH, SEASIDE_HOST, SEASIDE_REDIRECT_URL, SEASIDE_URL } from "@/lib/site"

describe("site constants", () => {
  it("Book an Event and contact page use /contact", () => {
    expect(CONTACT_PAGE_PATH).toBe("/contact")
  })

  it("SEA//SIDE legacy microsite host is seaside.lupfr.com", () => {
    expect(SEASIDE_HOST).toBe("seaside.lupfr.com")
  })

  it("SEA//SIDE legacy URL derives from the seaside host", () => {
    expect(SEASIDE_URL).toBe("https://seaside.lupfr.com")
  })

  it("SEA//SIDE is decommissioned and redirects to seaside.la", () => {
    expect(SEASIDE_REDIRECT_URL).toBe("https://seaside.la/")
  })
})
