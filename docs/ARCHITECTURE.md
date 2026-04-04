# Architecture

**High-level.** Single Next.js app (App Router). Static/semi-static pages driven by generated JSON; two API routes for email (contact, newsletter). No database; no auth. Build step compiles YAML → JSON before `next build`.

**Layers.**

- **Data:** `data/*.yml` (source of truth) → `scripts/generate-data.js` → `lib/data/generated/*.json`. Re-exported via `lib/events.ts`, `lib/data/artists.ts`, `lib/data/services.ts`, `lib/data/partners.ts` for type-safe consumption.
- **UI:** `app/` (routes, layout, metadata), `components/` (sections and UI). Home is a single scroll of sections (Hero, Reviews, Events, Services, Artists, About, Contact, Footer). Event detail at `app/events/[slug]/page.tsx`.
- **API:** `app/api/contact/route.ts` (POST, form → Resend), `app/api/newsletter/route.ts` (POST, email → Resend; sends internal notification + welcome to subscriber).
- **Email:** Resend client in `lib/resend.ts`; templates in `lib/email-templates`. Requires `RESEND_API_KEY` in env. Contact uses fixed `CONTACT_FORM_TO_EMAIL` (`will@lupfr.com`); newsletter internal copy uses `RESEND_TO_EMAIL` (optional env override).

**Invariants.**

- Content is edited via YAML + images only; component code stays stable for content updates.
- API routes depend on Resend; missing key returns 500 with explicit error message (no silent fallback).
- No server-side secrets or user data beyond what’s needed for sending email; no persistence of form payloads.
