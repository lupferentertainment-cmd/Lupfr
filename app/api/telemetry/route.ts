import { NextResponse } from "next/server"
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit"
import { isSupabaseConfigured, insertTelemetryEvent } from "@/lib/supabase-server"
import { parseTelemetryBody } from "@/lib/telemetry"

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit({
    key: createRateLimitKey(request, "api-telemetry"),
    limit: 60,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  let body: unknown
  try {
    // sendBeacon often posts as text/plain; parse from raw text.
    const raw = await request.text()
    body = JSON.parse(raw) as unknown
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = parseTelemetryBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Telemetry is temporarily unavailable." },
      { status: 503 }
    )
  }

  const result = await insertTelemetryEvent(parsed.value)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Could not store telemetry event." },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
