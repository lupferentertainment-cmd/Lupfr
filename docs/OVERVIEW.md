# LUPFR – Overview

**Purpose.** This repo is the source for the LUPFR Entertainment marketing site: San Francisco music event production (boat parties, rooftop/warehouse events, talent curation). The site is not a product app; it is a content-driven marketing and contact site.

**Stack.** Next.js 16 (App Router), React 19, Bun (install/scripts/lint), Tailwind CSS 4, Vercel for hosting. Email via Resend (contact form, newsletter).

**Content model.** Site content is data-driven: YAML in `data/` (events, artists, services, partners) is compiled at build time by `scripts/generate-data.js` into JSON under `lib/data/generated/`. Images live in `public/` (e.g. `public/artists/`, `public/events/`). No CMS; content changes = edit YAML + rebuild.

**Docs in this repo.** The files in `docs/` are for **repository context only**: onboarding, Cursor/context engineering, and alignment between code and spec. They are **not** served by the website or exposed to end users.

**Canonical doc set.** Authoritative specs live in: OVERVIEW (this file), ARCHITECTURE, DESIGN, REQUIREMENTS, API, DEPLOYMENT, TESTING. New knowledge is merged into these; no feature-specific docs.
