type RecordedFetchCall = [string, RequestInit]

function getFirstFetchCall(fetchMock: { mock: { calls: unknown[][] } }): RecordedFetchCall {
  const call = fetchMock.mock.calls[0]
  expect(call).toBeDefined()
  return call as unknown as RecordedFetchCall
}

describe("POST /api/phone-list", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://example.test/webhook"
    delete process.env.GOOGLE_SHEETS_SECRET
    delete process.env.GOOGLE_SHEETS_SECRET_FIELD
  })

  it("rejects missing name", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ email: "user@example.com", phone: "+1 415 555 0100" }),
    }))

    expect(res.status).toBe(400)
  })

  it("rejects invalid phone", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ name: "Jane", email: "jane@example.com", phone: "123" }),
    }))

    expect(res.status).toBe(400)
  })

  it("forwards valid payload to webhook", async () => {
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "origin": "https://lupfr.com",
        "user-agent": "vitest",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1 (415) 555-0100",
      }),
    }))

    expect(res.status).toBe(200)
    const payload = await res.json()
    expect(payload.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl, init] = getFirstFetchCall(fetchMock)
    expect(calledUrl).toBe("https://example.test/webhook")
    expect(init?.method).toBe("POST")
    expect(init?.headers).toMatchObject({
      "Content-Type": "text/plain;charset=utf-8",
    })
    const forwarded = JSON.parse(String(init?.body)) as {
      name: string
      email: string
      phone: string
    }
    expect(forwarded.name).toBe("Jane Doe")
    expect(forwarded.email).toBe("jane@example.com")
    expect(forwarded.phone).toBe("+1 (415) 555-0100")
  })

  it("accepts email only and omits phone from webhook JSON", async () => {
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane",
        email: "jane@example.com",
      }),
    }))

    expect(res.status).toBe(200)
    const [, init] = getFirstFetchCall(fetchMock)
    const forwarded = JSON.parse(String(init?.body)) as Record<string, string>
    expect(forwarded.email).toBe("jane@example.com")
    expect("phone" in forwarded).toBe(false)
  })

  it("accepts phone only and omits email from webhook JSON", async () => {
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane",
        phone: "+1 (415) 555-0100",
      }),
    }))

    expect(res.status).toBe(200)
    const [, init] = getFirstFetchCall(fetchMock)
    const forwarded = JSON.parse(String(init?.body)) as Record<string, string>
    expect(forwarded.phone).toBe("+1 (415) 555-0100")
    expect("email" in forwarded).toBe(false)
  })

  it("rejects when email and phone are both absent", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({ name: "Jane" }),
    }))

    expect(res.status).toBe(400)
  })

  it("rejects invalid email when an email is provided", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane",
        email: "not-an-email",
        phone: "+1 (415) 555-0100",
      }),
    }))

    expect(res.status).toBe(400)
  })

  it("rejects invalid JSON body", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: "{",
    }))

    expect(res.status).toBe(400)
  })

  it("returns 500 when webhook URL is not configured", async () => {
    const prev = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    delete process.env.GOOGLE_SHEETS_WEBHOOK_URL
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    try {
      const { POST } = await import("@/app/api/phone-list/route")

      const res = await POST(new Request("http://localhost/api/phone-list", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
        },
        body: JSON.stringify({
          name: "Jane",
          email: "jane@example.com",
        }),
      }))

      expect(res.status).toBe(500)
    } finally {
      if (prev === undefined) {
        delete process.env.GOOGLE_SHEETS_WEBHOOK_URL
      } else {
        process.env.GOOGLE_SHEETS_WEBHOOK_URL = prev
      }
    }
  })

  it("returns 502 when the webhook responds with a non-OK status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("bad", { status: 502, statusText: "Bad Gateway" }))
    )
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane",
        email: "jane@example.com",
      }),
    }))

    expect(res.status).toBe(502)
    const json = (await res.json()) as { error?: string; upstreamStatus?: number }
    expect(json.error).toContain("rejected")
    expect(json.upstreamStatus).toBe(502)
  })

  it("returns 502 when the webhook request throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down")
    }))
    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane",
        email: "jane@example.com",
      }),
    }))

    expect(res.status).toBe(502)
  })

  it("includes secret in webhook JSON when GOOGLE_SHEETS_SECRET is set", async () => {
    process.env.GOOGLE_SHEETS_SECRET = "test-shared-secret"
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1 (415) 555-0100",
      }),
    }))

    expect(res.status).toBe(200)
    const [, init] = getFirstFetchCall(fetchMock)
    const body = JSON.parse(String(init?.body)) as { secret: string; name: string }
    expect(body.secret).toBe("test-shared-secret")
    expect(body.name).toBe("Jane Doe")
  })

  it("uses GOOGLE_SHEETS_SECRET_FIELD for the shared secret key", async () => {
    process.env.GOOGLE_SHEETS_SECRET = "test-shared-secret"
    process.env.GOOGLE_SHEETS_SECRET_FIELD = "apiSecret"
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const { POST } = await import("@/app/api/phone-list/route")

    const res = await POST(new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200)}`,
      },
      body: JSON.stringify({
        name: "Jane",
        email: "jane@example.com",
      }),
    }))

    expect(res.status).toBe(200)
    const [, init] = getFirstFetchCall(fetchMock)
    const body = JSON.parse(String(init?.body)) as { apiSecret: string; secret?: string }
    expect(body.apiSecret).toBe("test-shared-secret")
    expect(body.secret).toBeUndefined()
  })

  it("enforces rate limiting", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { status: 200 })))
    const { POST } = await import("@/app/api/phone-list/route")

    const ip = `203.0.113.${Math.floor(Math.random() * 200)}`
    const makeReq = () => new Request("http://localhost/api/phone-list", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({ name: "Jane", email: "jane@example.com", phone: "+14155550100" }),
    })

    for (let i = 0; i < 6; i += 1) {
      const res = await POST(makeReq())
      expect(res.status).toBe(200)
    }

    const blocked = await POST(makeReq())
    expect(blocked.status).toBe(429)
  })
})
