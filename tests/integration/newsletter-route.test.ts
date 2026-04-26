const sendMock = vi.hoisted(() => vi.fn())
const getResendClientMock = vi.hoisted(() =>
  vi.fn(() => ({
    emails: { send: sendMock },
  }))
)

vi.mock("@/lib/resend", () => ({
  getResendClient: getResendClientMock,
  RESEND_TO_EMAIL: "team@example.com",
  RESEND_FROM_EMAIL: "from@example.com",
}))

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ data: { id: "mail_1" }, error: null })
    getResendClientMock.mockImplementation(() => ({
      emails: { send: sendMock },
    }))
  })

  it("rejects invalid JSON body", async () => {
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: "{",
    }))

    expect(res.status).toBe(400)
  })

  it("rejects empty email", async () => {
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "" }),
    }))

    expect(res.status).toBe(400)
  })

  it("returns 500 when Resend is not configured", async () => {
    getResendClientMock.mockImplementationOnce(() => {
      throw new Error("Missing RESEND_API_KEY")
    })
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    }))

    expect(res.status).toBe(500)
  })

  it("returns 502 when send throws a non-Error", async () => {
    sendMock.mockRejectedValueOnce("network")
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Failed to send")
  })

  it("returns 502 when send throws", async () => {
    sendMock.mockRejectedValueOnce(new Error("network"))
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    }))

    expect(res.status).toBe(502)
  })

  it("returns 502 when internal notification send fails", async () => {
    sendMock.mockImplementation(async (args: { to?: string }) => {
      if (args.to === "team@example.com") {
        return { data: undefined, error: { message: "Rejected" } }
      }
      return { data: { id: "w" }, error: null }
    })
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Rejected")
  })

  it("returns 502 when welcome email send fails", async () => {
    sendMock.mockImplementation(async (args: { to?: string }) => {
      if (args.to === "fan@example.com") {
        return { data: undefined, error: { message: undefined } }
      }
      return { data: { id: "i" }, error: null }
    })
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toBe("Failed to send welcome email")
  })

  it("rejects invalid email", async () => {
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "bad-email" }),
    }))

    expect(res.status).toBe(400)
  })

  it("sends internal and welcome emails", async () => {
    const { POST } = await import("@/app/api/newsletter/route")

    const res = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    }))

    expect(res.status).toBe(200)
    expect(sendMock).toHaveBeenCalledTimes(2)
  })

  it("rate limits repeated requests", async () => {
    const { POST } = await import("@/app/api/newsletter/route")

    const ip = `203.0.113.${Math.floor(Math.random() * 200)}`
    const makeReq = () => new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({ email: "fan@example.com" }),
    })

    for (let i = 0; i < 5; i += 1) {
      const res = await POST(makeReq())
      expect(res.status).toBe(200)
    }

    const blocked = await POST(makeReq())
    expect(blocked.status).toBe(429)
  })
})
