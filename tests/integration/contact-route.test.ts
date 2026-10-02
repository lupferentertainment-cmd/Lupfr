const sendMock = vi.hoisted(() => vi.fn())
const getResendClientMock = vi.hoisted(() =>
  vi.fn(() => ({
    emails: { send: sendMock },
  }))
)

vi.mock("@/lib/resend", () => ({
  getResendClient: getResendClientMock,
  CONTACT_FORM_TO_EMAIL: "team@example.com",
  RESEND_FROM_EMAIL: "from@example.com",
}))

describe("POST /api/contact", () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ data: { id: "mail_1" }, error: null })
    getResendClientMock.mockImplementation(() => ({
      emails: { send: sendMock },
    }))
  })

  it("rejects invalid JSON body", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: "not-json{",
    }))

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toContain("JSON")
  })

  it("rejects missing required fields", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "",
        name: "Jane",
        email: "jane@example.com",
        message: "",
      }),
    }))

    expect(res.status).toBe(400)
  })

  it("returns 500 when Resend client throws a non-Error", async () => {
    getResendClientMock.mockImplementationOnce(() => {
      throw "missing"
    })
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(500)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Resend not configured.")
  })

  it("returns 500 when Resend is not configured", async () => {
    getResendClientMock.mockImplementationOnce(() => {
      throw new Error("Missing RESEND_API_KEY")
    })
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(500)
  })

  it("returns 502 when send throws a non-Error", async () => {
    sendMock.mockRejectedValueOnce("upstream")
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Failed to send email")
  })

  it("returns 502 when send throws", async () => {
    sendMock.mockRejectedValueOnce(new Error("Resend outage"))
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(502)
  })

  it("returns 502 when send reports an API error object", async () => {
    sendMock.mockResolvedValueOnce({ data: undefined, error: { message: "Invalid domain" } })
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Invalid domain")
  })

  it("returns 502 with fallback when send error omits message", async () => {
    sendMock.mockResolvedValueOnce({ data: undefined, error: {} })
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Failed to send email")
  })

  it("rejects invalid email", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "invalid",
        message: "hello",
      }),
    }))

    expect(res.status).toBe(400)
  })

  it("sends email for valid payload", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Need a DJ for Friday night",
      }),
    }))

    expect(res.status).toBe(200)
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  it("ignores non-string optional company/budget fields", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane Doe",
        email: "jane@example.com",
        company: 12,
        budget: null,
        message: "Need a DJ for Friday night",
      }),
    }))

    expect(res.status).toBe(200)
  })

  it("accepts the Start Planning wizard's optional fields", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Corporate Event",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Need a full production",
        phone: "555-123-4567",
        services: ["Live Events", "Talent Booking"],
        guestCount: "150–400",
        eventDate: "2026-12-05",
        flexibleDate: true,
        city: "Los Angeles",
        venue: "Rooftop bar",
      }),
    }))

    expect(res.status).toBe(200)
    expect(sendMock).toHaveBeenCalledTimes(1)
    const sendArgs = sendMock.mock.calls[0]![0] as { html: string }
    expect(sendArgs.html).toContain("Live Events, Talent Booking")
    expect(sendArgs.html).toContain("Rooftop bar")
  })

  it("ignores non-string/non-array optional wizard fields rather than crashing", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Corporate Event",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "hello",
        phone: 12345,
        services: "not-an-array",
        guestCount: null,
        eventDate: 20261205,
        flexibleDate: "yes",
        city: 5,
        venue: null,
      }),
    }))

    expect(res.status).toBe(200)
  })

  it("filters out non-string entries from the services array", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Corporate Event",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "hello",
        services: ["Live Events", 42, "", null],
      }),
    }))

    expect(res.status).toBe(200)
    const sendArgs = sendMock.mock.calls[0]![0] as { html: string }
    expect(sendArgs.html).toContain("Live Events")
  })

  it("treats blank optional wizard fields as absent", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const res = await POST(new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        inquiryType: "Corporate Event",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "hello",
        phone: "   ",
        guestCount: "",
        eventDate: "  ",
        flexibleDate: false,
        city: "",
        venue: "   ",
      }),
    }))

    expect(res.status).toBe(200)
    const sendArgs = sendMock.mock.calls[sendMock.mock.calls.length - 1]![0] as { html: string }
    expect(sendArgs.html).not.toContain("Estimated guests")
    expect(sendArgs.html).not.toContain("Venue / neighborhood")
  })

  it("rate limits repeated requests", async () => {
    const { POST } = await import("@/app/api/contact/route")

    const ip = `203.0.113.${Math.floor(Math.random() * 200)}`
    const makeReq = () => new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({
        inquiryType: "Book an Event",
        name: "Jane",
        email: "jane@example.com",
        message: "hello",
      }),
    })

    for (let i = 0; i < 5; i += 1) {
      const res = await POST(makeReq())
      expect(res.status).toBe(200)
    }

    const blocked = await POST(makeReq())
    expect(blocked.status).toBe(429)
  })
})
