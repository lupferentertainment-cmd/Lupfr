# LUPFR

San Francisco's premier music event production company. Creating unforgettable experiences in the Bay and beyond.

## Setup

This project uses **Bun**. With [Corepack](https://nodejs.org/api/corepack.html) enabled (`corepack enable`), `npm install` and `npm run` will use Bun.

1. Install dependencies: `bun install`
2. Copy environment: `cp .env.example .env.local`
3. Add your [Resend](https://resend.com) API key to `.env.local`:
   - `RESEND_API_KEY=re_xxxxxxxxx` (get a key at https://resend.com/api-keys)
   - Required for the contact form and newsletter signup to send email to `will@lupfr.com`
4. Run dev: `bun run dev`

## Resend

Contact form submissions and newsletter signups are sent via [Resend](https://resend.com). Without `RESEND_API_KEY` in `.env.local`, those endpoints return an error asking you to add the key. Verify your `lupfr.com` domain in Resend and use a key with send permission.

## Build

- `bun run build` – production build
- `bun run start` – run production server
