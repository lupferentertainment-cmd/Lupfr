# API

**Scope.** The app exposes three HTTP APIs; all are used by the site front-end only. No public API versioning or external contract.

---

## POST /api/contact

**Purpose.** Submit contact form; send email via Resend to `will@lupfr.com` (`CONTACT_FORM_TO_EMAIL` in `lib/resend.ts`). This recipient is not overridden by `RESEND_TO_EMAIL`, so contact leads always reach the same inbox.

**Request.** `Content-Type: application/json`. Body (all strings except where noted):

| Field        | Required | Description                    |
|-------------|----------|--------------------------------|
| inquiryType | Yes      | Type of inquiry                |
| name        | Yes      | Sender name                    |
| email       | Yes      | Sender email                   |
| company     | No       | Company name                   |
| budget      | No       | Budget / range                 |
| message     | Yes      | Message body                   |

**Responses.**

- `200`: `{ "success": true, "id": "<resend-id>" }`
- `400`: Invalid JSON or missing required fields → `{ "error": "..." }`
- `429`: Too many requests from one client in a short window → `{ "error": "Too many requests. Please try again shortly." }`
- `500`: Resend not configured (missing `RESEND_API_KEY`) → `{ "error": "..." }`
- `502`: Resend send failed → `{ "error": "..." }`

---

## POST /api/newsletter

**Purpose.** Newsletter signup: notify internal inbox and send welcome email to subscriber via Resend.

**Request.** `Content-Type: application/json`. Body:

| Field | Required | Description   |
|-------|----------|---------------|
| email | Yes      | Subscriber email |

**Responses.**

- `200`: `{ "success": true, "id": "<resend-id>" }`
- `400`: Invalid JSON or missing/invalid email → `{ "error": "Email is required" }` (or similar)
- `429`: Too many requests from one client in a short window → `{ "error": "Too many requests. Please try again shortly." }`
- `500`: Resend not configured → `{ "error": "..." }`
- `502`: Resend send failed (internal and/or welcome) → `{ "error": "..." }`

---

**Internal.** Resend client: `lib/resend.ts` (`getResendClient()`). Contact `to`: `CONTACT_FORM_TO_EMAIL` (`will@lupfr.com`). Newsletter internal notification `to`: `RESEND_TO_EMAIL` (env override optional; default `will@lupfr.com`). Sender: `LUPFR Entertainment <hello@lupfr.com>` (verified domain in Resend).

---

## POST /api/phone-list

**Purpose.** Capture visitor contact-list signup from popup/footer/contact sections and append to Google Sheets via webhook.

**Request.** `Content-Type: application/json`. Body:

| Field | Required | Description |
|-------|----------|-------------|
| name  | Yes      | Visitor name |
| email | No       | Omitted if not collected; if present, validated as email |
| phone | No*      | Visitor phone number (`10-15` digits, symbols allowed) |

At least one of `email` or `phone` must be present. The site popup collects **name + phone** only. Footer/contact sections may still collect email and/or phone.

Phone numbers are validated with a permissive phone pattern. Emails, when present, use a standard email format pattern.

**Responses.**

- `200`: `{ "success": true }`
- `400`: Invalid JSON, missing `name`, missing both `email` and `phone`, or invalid email/phone format → `{ "error": "..." }`
- `429`: Too many requests from one client in a short window → `{ "error": "Too many requests. Please try again shortly." }`
- `500`: Google Sheets webhook not configured (`GOOGLE_SHEETS_WEBHOOK_URL` missing) → `{ "error": "..." }`
- `502`: Webhook network failure or non-OK webhook response → `{ "error": "...", "upstreamStatus"?: number }` (`upstreamStatus` is the Google endpoint’s HTTP status when the webhook returned a non-2xx response)

**Internal.** Route forwards `{ name, email, phone, source, page, userAgent, submittedAt }` and, when `GOOGLE_SHEETS_SECRET` is configured, `secret` to `GOOGLE_SHEETS_WEBHOOK_URL` with `POST` and body JSON using `Content-Type: text/plain;charset=utf-8` (see `docs/DEPLOYMENT.md`).
