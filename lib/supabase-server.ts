import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { rowsToCsv } from "@/lib/admin-export"
import type { TelemetryPayload } from "@/lib/telemetry"

export type ContactRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  source: string
  page: string | null
  user_agent: string | null
  submitted_at: string
  created_at: string
}

export type TelemetryRow = {
  id: string
  event_name: string
  path: string | null
  href: string | null
  label: string | null
  meta: Record<string, string>
  created_at: string
}

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? ""
}

export function isSupabaseConfigured(): boolean {
  return Boolean(readEnv("SUPABASE_URL") && readEnv("SUPABASE_SERVICE_ROLE_KEY"))
}

let cachedClient: SupabaseClient | null | undefined

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (cachedClient) return cachedClient
  cachedClient = createClient(readEnv("SUPABASE_URL"), readEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedClient
}

/** Reset singleton between Vitest modules. */
export function resetSupabaseAdminForTests(): void {
  cachedClient = undefined
}

export function contactsToCsv(contacts: ContactRow[]): string {
  return rowsToCsv(
    ["name", "email", "phone", "source", "page", "submitted_at"],
    contacts.map((row) => ({
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      source: row.source,
      page: row.page ?? "",
      submitted_at: row.submitted_at,
    }))
  )
}

export async function insertContact(input: {
  name: string
  email?: string
  phone?: string
  source?: string
  page?: string
  userAgent?: string
  submittedAt?: string
}): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseAdmin()
  if (!client) return { ok: false, error: "Supabase is not configured." }

  const { error } = await client.from("contacts").insert({
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    source: input.source || "lupfr.com",
    page: input.page || null,
    user_agent: input.userAgent || null,
    submitted_at: input.submittedAt || new Date().toISOString(),
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function listContacts(limit = 100): Promise<{
  configured: boolean
  contacts: ContactRow[]
  error?: string
}> {
  if (!isSupabaseConfigured()) {
    return { configured: false, contacts: [] }
  }
  const client = getSupabaseAdmin()
  if (!client) return { configured: false, contacts: [] }

  const { data, error } = await client
    .from("contacts")
    .select("id,name,email,phone,source,page,user_agent,submitted_at,created_at")
    .order("submitted_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 500))

  if (error) {
    return { configured: true, contacts: [], error: error.message }
  }
  return { configured: true, contacts: (data ?? []) as ContactRow[] }
}

export async function insertTelemetryEvent(
  payload: TelemetryPayload
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseAdmin()
  if (!client) return { ok: false, error: "Supabase is not configured." }

  const { error } = await client.from("telemetry_events").insert({
    event_name: payload.eventName,
    path: payload.path,
    href: payload.href ?? null,
    label: payload.label ?? null,
    meta: payload.meta ?? {},
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function listTelemetryEvents(limit = 100): Promise<{
  configured: boolean
  events: TelemetryRow[]
  byName: Array<{ name: string; count: number }>
  error?: string
}> {
  if (!isSupabaseConfigured()) {
    return { configured: false, events: [], byName: [] }
  }
  const client = getSupabaseAdmin()
  if (!client) return { configured: false, events: [], byName: [] }

  const { data, error } = await client
    .from("telemetry_events")
    .select("id,event_name,path,href,label,meta,created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 500))

  if (error) {
    return { configured: true, events: [], byName: [], error: error.message }
  }

  const events = (data ?? []) as TelemetryRow[]
  const counts = new Map<string, number>()
  for (const event of events) {
    counts.set(event.event_name, (counts.get(event.event_name) ?? 0) + 1)
  }
  const byName = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return { configured: true, events, byName }
}
