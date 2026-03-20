# Design

**Product.** Marketing site for LUPFR Entertainment: hero, social proof (metrics carousel in the Reviews section), events list + event detail pages, services, artists, about, contact form, newsletter signup, footer. Single primary scroll on home; event detail is a dedicated route.

**About.** The large horizontal text marquee that listed service phrases (boat parties, rooftop sessions, etc.) is **archived** (see `_deprecated/about-marquee.tsx`); it is not rendered on the live About section.

**Reviews.** The scrolling testimonial marquee (desktop three-layer + mobile single strip) is **archived** (`_deprecated/reviews-marquee.tsx` + `_deprecated/reviews-marquee.css`); the live section shows only the rotating metrics carousel. Metrics render as larger card tiles; on `(hover: hover)` + `(pointer: fine)` they tilt slightly toward the cursor (transform-only while the pointer moves). `prefers-reduced-motion` turns off tilt.

**Mobile performance (≤767px).** Hero uses a static grid/orbs (no continuous Motion loops), longer hero phrase rotation, `next/image` for the poster, and a non-animated scroll hint. Reviews: slower stats carousel interval, no scroll-linked section fade (full opacity). Top scroll progress bar is omitted. Breakpoint matches `hooks/use-mobile.ts`.

**Content-driven sections.**

- **Events:** Ordered list from `data/events.yml` (dateISO for sorting; past vs upcoming). Each event: image, title, subtitle, date, time, location, ticket link, description. Detail page at `/events/[slug]`.
- **Artists:** From `data/artists.yml`. Card: image, name, genre, bio, social links (Spotify, Apple Music, Instagram, etc.), optional featured track (Spotify or SoundCloud embed).
- **Services:** From `data/services.yml`. Display as defined in YAML (e.g. titles, descriptions, icons).
- **Partners:** From `data/partners.yml`; typically logos/links in footer or dedicated block.

**UI/UX.** Fonts: Space Grotesk (sans), Inter (body), Playfair Display (serif). Theme support via `ThemeProvider` (next-themes). Toasts (sonner) for form feedback. Contact and newsletter forms post to API routes; success/error surfaced in UI.

**Assets.** Images under `public/`; YAML references paths from site root (e.g. `image: "/artists/name.jpeg"`). OG image via `app/opengraph-image`; metadata in `app/layout.tsx`.
