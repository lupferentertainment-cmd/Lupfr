# API

**Scope.** The app exposes two HTTP APIs; both are used by the site front-end only. No public API versioning or external contract.

---

## POST /api/contact

**Purpose.** Submit contact form; send email via Resend to configured inbox.

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

**Internal.** Resend client: `lib/resend.ts` (`getResendClient()`). Recipient overridable via `RESEND_TO_EMAIL`; default `will@lupfr.com`. Sender: `LUPFR Entertainment <hello@lupfr.com>` (verified domain in Resend).
