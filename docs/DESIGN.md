# Design

**Product.** Marketing site for LUPFR Entertainment: hero, social proof (reviews), events list + event detail pages, services, artists, about, contact form, newsletter signup, footer. Single primary scroll on home; event detail is a dedicated route.

**Content-driven sections.**

- **Events:** Ordered list from `data/events.yml` (dateISO for sorting; past vs upcoming). Each event: image, title, subtitle, date, time, location, ticket link, description. Detail page at `/events/[slug]`.
- **Artists:** From `data/artists.yml`. Card: image, name, genre, bio, social links (Spotify, Apple Music, Instagram, etc.), optional featured track (Spotify or SoundCloud embed).
- **Services:** From `data/services.yml`. Display as defined in YAML (e.g. titles, descriptions, icons).
- **Partners:** From `data/partners.yml`; typically logos/links in footer or dedicated block.

**UI/UX.** Fonts: Space Grotesk (sans), Inter (body), Playfair Display (serif). Theme support via `ThemeProvider` (next-themes). Toasts (sonner) for form feedback. Contact and newsletter forms post to API routes; success/error surfaced in UI.

**Assets.** Images under `public/`; YAML references paths from site root (e.g. `image: "/artists/name.jpeg"`). OG image via `app/opengraph-image`; metadata in `app/layout.tsx`.
