import {
  isValidEmail,
  isValidPhone,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
} from "@/lib/contact-input"

describe("contact input sanitizers", () => {
  it("sanitizes name and phone spacing", () => {
    expect(sanitizeName("  Jane    Doe  ")).toBe("Jane Doe")
    expect(sanitizePhone("  (415)   555-0100  ")).toBe("(415) 555-0100")
  })

  it("normalizes emails", () => {
    expect(sanitizeEmail("  USER@Example.COM  ")).toBe("user@example.com")
  })
})

describe("contact input validators", () => {
  it("accepts valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true)
    expect(isValidEmail("first.last+tag@domain.co")).toBe(true)
  })

  it("rejects invalid email addresses", () => {
    expect(isValidEmail("bad-email")).toBe(false)
    expect(isValidEmail("user@localhost")).toBe(false)
  })

  it("accepts valid phone numbers with at least 10 digits", () => {
    expect(isValidPhone("(415) 555-0100")).toBe(true)
    expect(isValidPhone("+1 415 555 0100")).toBe(true)
  })

  it("rejects invalid phone numbers", () => {
    expect(isValidPhone("123-4567")).toBe(false)
    expect(isValidPhone("abc1234567")).toBe(false)
    expect(isValidPhone("1234567890123456")).toBe(false)
  })
})
