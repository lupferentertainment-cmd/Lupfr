import { NextResponse } from "next/server"
import {
    isValidEmail,
    isValidPhone,
    sanitizeEmail,
    sanitizeName,
    sanitizePhone,
} from "@/lib/contact-input"
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit"
import { insertContact, isSupabaseConfigured } from "@/lib/supabase-server"

interface PhoneListBody {
    name?: string
    phone?: string
    email?: string
}

function getSheetsWebhookUrl(): string {
    const raw = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim()
    if (!raw) {
        throw new Error(
            "GOOGLE_SHEETS_WEBHOOK_URL is not set. Add your Google Apps Script web app URL in environment variables."
        )
    }
    return raw
}

export async function POST(request: Request) {
    const rateLimited = enforceRateLimit({
        key: createRateLimitKey(request, "api-phone-list"),
        limit: 6,
        windowMs: 60_000,
    })
    if (rateLimited) return rateLimited

    let body: PhoneListBody
    try {
        body = (await request.json()) as PhoneListBody
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const name = sanitizeName(typeof body.name === "string" ? body.name : "")
    const phone = sanitizePhone(typeof body.phone === "string" ? body.phone : "")
    const email = sanitizeEmail(typeof body.email === "string" ? body.email : "")

    if (!name) {
        return NextResponse.json(
            { error: "Name is required." },
            { status: 400 }
        )
    }

    if (!email && !phone) {
        return NextResponse.json(
            { error: "Please provide an email or phone number." },
            { status: 400 }
        )
    }

    if (email && !isValidEmail(email)) {
        return NextResponse.json(
            { error: "Please enter a valid email address." },
            { status: 400 }
        )
    }

    if (phone && !isValidPhone(phone)) {
        return NextResponse.json(
            { error: "Please enter a valid phone number." },
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

    const payload: Record<string, string> = {
        name,
        source: "lupfr.com",
        page: request.headers.get("origin") ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
        submittedAt: new Date().toISOString(),
    }
    if (email) payload.email = email
    if (phone) payload.phone = phone

    const sharedSecret = process.env.GOOGLE_SHEETS_SECRET?.trim()
    if (sharedSecret) {
        const secretKey = process.env.GOOGLE_SHEETS_SECRET_FIELD?.trim() || "secret"
        payload[secretKey] = sharedSecret
    }

    let webhookResponse: Response
    try {
        // Google Apps Script web apps often reject or mishandle POST with
        // Content-Type: application/json on the script.google.com hop; plain
        // text still delivers JSON in postData.contents and avoids 405/502 chains.
        webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
            cache: "no-store",
            redirect: "follow",
        })
    } catch {
        return NextResponse.json({ error: "Could not reach Google Sheets webhook." }, { status: 502 })
    }

    if (!webhookResponse.ok) {
        const base = {
            error: "Google Sheets webhook rejected the request.",
            upstreamStatus: webhookResponse.status,
        } as const
        if (process.env.NODE_ENV === "development") {
            let upstreamPreview = ""
            try {
                upstreamPreview = (await webhookResponse.clone().text()).slice(0, 500)
            } catch {
                upstreamPreview = ""
            }
            return NextResponse.json(
                {
                    ...base,
                    debug: {
                        secretEnvPresent: Boolean(
                            process.env.GOOGLE_SHEETS_SECRET?.trim()
                        ),
                        secretJsonKey:
                            process.env.GOOGLE_SHEETS_SECRET_FIELD?.trim() ||
                            "secret",
                        upstreamPreview: upstreamPreview || undefined,
                    },
                },
                { status: 502 }
            )
        }
        return NextResponse.json(
            { ...base },
            { status: 502 }
        )
    }

    // Dual-write to Supabase for in-admin contacts (Sheets remains source of record).
    // Never fail the public signup if the optional store is down.
    if (isSupabaseConfigured()) {
        try {
            await insertContact({
                name,
                email: email || undefined,
                phone: phone || undefined,
                source: payload.source,
                page: payload.page,
                userAgent: payload.userAgent,
                submittedAt: payload.submittedAt,
            })
        } catch {
            // intentional: Sheets already accepted the lead
        }
    }

    return NextResponse.json({ success: true })
}
