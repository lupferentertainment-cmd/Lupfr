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
| phone | Conditional | Visitor phone number (required when `email` is absent) |
| email | Conditional | Visitor email (required when `phone` is absent) |

Phone numbers are validated as a permissive phone pattern (`7-24` chars, digits and common symbols). Emails are validated with a standard email format pattern.

**Responses.**

- `200`: `{ "success": true }`
- `400`: Invalid JSON, missing required fields (`name` and either `phone` or `email`), or invalid phone/email format → `{ "error": "..." }`
- `500`: Google Sheets webhook not configured (`GOOGLE_SHEETS_WEBHOOK_URL` missing) → `{ "error": "..." }`
- `502`: Webhook network failure or non-OK webhook response → `{ "error": "..." }`

**Internal.** Route forwards `{ name, phone, email, source, page, userAgent, submittedAt }` to `GOOGLE_SHEETS_WEBHOOK_URL` with `POST application/json`.
