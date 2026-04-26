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
