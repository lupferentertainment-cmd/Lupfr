import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const FIXTURE_PASSWORD = "test-admin-password-not-real"
const FIXTURE_SECRET = "test-session-secret-at-least-32-bytes-long!!"

vi.mock("@/lib/supabase-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase-server")>(
    "@/lib/supabase-server"
  )
  return {
    ...actual,
    listContacts: vi.fn(),
  }
})

describe("GET /admin/api/contacts", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_PASSWORD = FIXTURE_PASSWORD
    process.env.ADMIN_SESSION_SECRET = FIXTURE_SECRET
    process.env.ADMIN_USERNAME = "will@lupfr.com"
    process.env.SUPABASE_URL = "https://example.supabase.co"
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"
  })

  afterEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  async function authedCookie(): Promise<string> {
    const { createAdminSessionToken, ADMIN_SESSION_COOKIE } = await import("@/lib/admin-auth")
    const token = createAdminSessionToken("will@lupfr.com")
    return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`
  }

  it("returns 401 without a session", async () => {
    const { GET } = await import("@/app/admin/api/contacts/route")
    const res = await GET(new Request("http://localhost/admin/api/contacts"))
    expect(res.status).toBe(401)
  })

  it("returns configured:false when listContacts reports unset", async () => {
    const { listContacts } = await import("@/lib/supabase-server")
    vi.mocked(listContacts).mockResolvedValue({ configured: false, contacts: [] })

    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/contacts/route")
    const res = await GET(
      new Request("http://localhost/admin/api/contacts", { headers: { cookie } })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { configured: boolean; contacts: unknown[] }
    expect(body.configured).toBe(false)
    expect(body.contacts).toEqual([])
  })

  it("returns contacts when authenticated", async () => {
    const { listContacts } = await import("@/lib/supabase-server")
    vi.mocked(listContacts).mockResolvedValue({
      configured: true,
      contacts: [
        {
          id: "c1",
          name: "Will",
          email: "will@example.com",
          phone: null,
          source: "lupfr.com",
          page: "https://lupfr.com",
          user_agent: "test",
          submitted_at: "2026-07-23T12:00:00.000Z",
          created_at: "2026-07-23T12:00:00.000Z",
        },
      ],
    })

    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/contacts/route")
    const res = await GET(
      new Request("http://localhost/admin/api/contacts", { headers: { cookie } })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { configured: boolean; contacts: Array<{ name: string }> }
    expect(body.configured).toBe(true)
    expect(body.contacts[0]?.name).toBe("Will")
  })
})
