export const TELEMETRY_EVENT_NAMES = ["page_impression", "cta_click"] as const

export type TelemetryEventName = (typeof TELEMETRY_EVENT_NAMES)[number]

export type TelemetryPayload = {
  eventName: TelemetryEventName
  path: string
  href?: string
  label?: string
  meta?: Record<string, string>
}

export type ParseResult =
  | { ok: true; value: TelemetryPayload }
  | { ok: false; error: string }

function isEventName(value: string): value is TelemetryEventName {
  return (TELEMETRY_EVENT_NAMES as readonly string[]).includes(value)
}

function asTrimmedString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

export function parseTelemetryBody(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." }
  }
  const record = body as Record<string, unknown>
  const eventNameRaw = asTrimmedString(record.eventName, 64)
  if (!eventNameRaw || !isEventName(eventNameRaw)) {
    return { ok: false, error: "Unsupported eventName." }
  }
  const path = asTrimmedString(record.path, 500)
  if (!path || !path.startsWith("/")) {
    return { ok: false, error: "path is required and must start with /." }
  }

  const href = asTrimmedString(record.href, 1000)
  const label = asTrimmedString(record.label, 200)
  let meta: Record<string, string> | undefined
  if (record.meta && typeof record.meta === "object" && !Array.isArray(record.meta)) {
    meta = {}
    for (const [key, value] of Object.entries(record.meta as Record<string, unknown>)) {
      if (typeof value === "string" && key.length <= 40) {
        meta[key.slice(0, 40)] = value.slice(0, 200)
      }
    }
  }

  return {
    ok: true,
    value: {
      eventName: eventNameRaw,
      path,
      ...(href ? { href } : {}),
      ...(label ? { label } : {}),
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    },
  }
}
