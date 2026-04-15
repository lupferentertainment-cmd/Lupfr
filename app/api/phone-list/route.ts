import { NextResponse } from "next/server"

interface PhoneListBody {
  name?: string
  phone?: string
}

const PHONE_PATTERN = /^[0-9+()\-\s]{7,24}$/

function getSheetsWebhookUrl(): string {
  const raw = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim()
  if (!raw) {
    throw new Error(
      "GOOGLE_SHEETS_WEBHOOK_URL is not set. Add your Google Apps Script web app URL in environment variables."
    )
  }
  return raw
}

function sanitizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function sanitizePhone(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export async function POST(request: Request) {
  let body: PhoneListBody
  try {
    body = (await request.json()) as PhoneListBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = sanitizeName(typeof body.name === "string" ? body.name : "")
  const phone = sanitizePhone(typeof body.phone === "string" ? body.phone : "")

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Missing required fields: name, phone" },
      { status: 400 }
    )
  }

  if (!PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 }
    )
  }

  let webhookUrl: string
  try {
    webhookUrl = getSheetsWebhookUrl()
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook not configured."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const payload = {
    name,
    phone,
    source: "lupfr.com",
    page: request.headers.get("origin") ?? "unknown",
    userAgent: request.headers.get("user-agent") ?? "unknown",
    submittedAt: new Date().toISOString(),
  }

  let webhookResponse: Response
  try {
    webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      { error: "Could not reach Google Sheets webhook." },
      { status: 502 }
    )
  }

  if (!webhookResponse.ok) {
    return NextResponse.json(
      { error: "Google Sheets webhook rejected the request." },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
