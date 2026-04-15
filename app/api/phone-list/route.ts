import { NextResponse } from "next/server"

interface PhoneListBody {
  name?: string
  phone?: string
  email?: string
}

const PHONE_PATTERN = /^[0-9+()\-\s]{7,24}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

function sanitizeEmail(value: string): string {
  return value.replace(/\s+/g, "").trim().toLowerCase()
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
  const email = sanitizeEmail(typeof body.email === "string" ? body.email : "")

  if (!name || (!phone && !email)) {
    return NextResponse.json(
      { error: "Missing required fields: name and either phone or email" },
      { status: 400 }
    )
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 }
    )
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    )
  }

  let webhookUrl: string
  try {
    webhookUrl = getSheetsWebhookUrl()
  } catch {
    return NextResponse.json(
      { error: "Signup is temporarily unavailable. Please try again shortly." },
      { status: 500 }
    )
  }

  const payload = {
    name,
    phone: phone || null,
    email: email || null,
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
