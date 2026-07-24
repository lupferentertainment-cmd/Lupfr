import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const insertMock = vi.fn()
const selectMock = vi.fn()
let failSelect = false
let failInsert = false

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "contacts" || table === "telemetry_events") {
        return {
          insert: (row: unknown) => {
            insertMock(table, row)
            if (failInsert) {
              return Promise.resolve({ error: { message: "insert failed" } })
            }
            return Promise.resolve({ error: null })
          },
          select: () => ({
            order: () => ({
              limit: () => {
                selectMock(table)
                if (failSelect) {
                  return Promise.resolve({ data: null, error: { message: "select failed" } })
                }
                if (table === "contacts") {
                  return Promise.resolve({
                    data: [
                      {
                        id: "1",
                        name: "Ada",
                        email: "ada@example.com",
                        phone: null,
                        source: "lupfr.com",
                        page: null,
                        user_agent: null,
                        submitted_at: "2026-07-23T12:00:00.000Z",
                        created_at: "2026-07-23T12:00:00.000Z",
                      },
                    ],
                    error: null,
                  })
                }
                return Promise.resolve({
                  data: [
                    {
                      id: "e1",
                      event_name: "page_impression",
                      path: "/",
                      href: null,
                      label: null,
                      meta: {},
                      created_at: "2026-07-23T12:00:00.000Z",
                    },
                    {
                      id: "e2",
                      event_name: "cta_click",
                      path: "/",
                      href: "/contact",
                      label: "Book an Event",
                      meta: {},
                      created_at: "2026-07-23T12:01:00.000Z",
                    },
                  ],
                  error: null,
                })
              },
            }),
          }),
        }
      }
      throw new Error(`unexpected table ${table}`)
    },
  })),
}))

describe("supabase-server", () => {
  const originalEnv = { ...process.env }

  beforeEach(async () => {
    vi.resetModules()
    insertMock.mockClear()
    selectMock.mockClear()
    failSelect = false
    failInsert = false
    process.env.SUPABASE_URL = "https://example.supabase.co"
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"
    const { resetSupabaseAdminForTests } = await import("@/lib/supabase-server")
    resetSupabaseAdminForTests()
  })

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  it("is configured when url + service role are set", async () => {
    const { isSupabaseConfigured } = await import("@/lib/supabase-server")
    expect(isSupabaseConfigured()).toBe(true)
  })

  it("is not configured when service role is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/supabase-server")
    expect(isSupabaseConfigured()).toBe(false)
    expect(getSupabaseAdmin()).toBeNull()
  })

  it("builds contacts CSV from rows", async () => {
    const { contactsToCsv } = await import("@/lib/supabase-server")
    const csv = contactsToCsv([
      {
        id: "1",
        name: "Ada",
        email: "ada@example.com",
        phone: null,
        source: "lupfr.com",
        page: "https://lupfr.com",
        user_agent: "test",
        submitted_at: "2026-07-23T12:00:00.000Z",
        created_at: "2026-07-23T12:00:00.000Z",
      },
    ])
    expect(csv).toContain("name,email,phone,source,page,submitted_at")
    expect(csv).toContain("Ada,ada@example.com")
  })

  it("inserts contacts and telemetry via admin client", async () => {
    const { insertContact, insertTelemetryEvent, listContacts, listTelemetryEvents } =
      await import("@/lib/supabase-server")

    await expect(
      insertContact({ name: "Ada", email: "ada@example.com" })
    ).resolves.toEqual({ ok: true })
    expect(insertMock).toHaveBeenCalledWith(
      "contacts",
      expect.objectContaining({ name: "Ada", email: "ada@example.com" })
    )

    await expect(
      insertTelemetryEvent({ eventName: "page_impression", path: "/" })
    ).resolves.toEqual({ ok: true })

    const contacts = await listContacts(10)
    expect(contacts.configured).toBe(true)
    expect(contacts.contacts[0]?.name).toBe("Ada")

    const telemetry = await listTelemetryEvents(10)
    expect(telemetry.configured).toBe(true)
    expect(telemetry.byName.some((row) => row.name === "cta_click")).toBe(true)
  })

  it("returns configured:false lists when unset", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { listContacts, listTelemetryEvents, insertContact, insertTelemetryEvent } =
      await import("@/lib/supabase-server")
    await expect(listContacts()).resolves.toEqual({ configured: false, contacts: [] })
    await expect(listTelemetryEvents()).resolves.toEqual({
      configured: false,
      events: [],
      byName: [],
    })
    await expect(insertContact({ name: "X" })).resolves.toMatchObject({ ok: false })
    await expect(
      insertTelemetryEvent({ eventName: "page_impression", path: "/" })
    ).resolves.toMatchObject({ ok: false })
  })

  it("surfaces select/insert errors", async () => {
    failSelect = true
    const { listContacts, listTelemetryEvents, resetSupabaseAdminForTests } =
      await import("@/lib/supabase-server")
    resetSupabaseAdminForTests()
    await expect(listContacts()).resolves.toMatchObject({
      configured: true,
      contacts: [],
      error: "select failed",
    })
    await expect(listTelemetryEvents()).resolves.toMatchObject({
      configured: true,
      events: [],
      error: "select failed",
    })

    failSelect = false
    failInsert = true
    resetSupabaseAdminForTests()
    const { insertContact, insertTelemetryEvent } = await import("@/lib/supabase-server")
    await expect(insertContact({ name: "X" })).resolves.toEqual({
      ok: false,
      error: "insert failed",
    })
    await expect(
      insertTelemetryEvent({ eventName: "cta_click", path: "/" })
    ).resolves.toEqual({ ok: false, error: "insert failed" })
  })
})
