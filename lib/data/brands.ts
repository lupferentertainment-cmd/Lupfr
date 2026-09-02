/**
 * Sub-brands data from data/brands.yml (build-time generated to generated/brands.json).
 */
import brandsJson from "@/lib/data/generated/brands.json"

export interface BrandConcept {
  heading: string
  body: string
}

/**
 * The brand's own verified account URLs, keyed by platform — any subset.
 * Only ever set for a real, owner-confirmed handle (see data/brands.yml's
 * doc comment); a platform with no entry here has no confirmed account of
 * its own yet, and `lib/data/media.ts` routes it "via" LUPFR's account
 * instead rather than inventing one.
 */
export interface BrandSocial {
  instagram?: string
  tiktok?: string
  linkedin?: string
  youtube?: string
}

export interface BrandItemRaw {
  key: string
  title: string
  tag: string
  accent: string
  image?: string
  description: string
  format: string
  externalUrl?: string
  comingSoon?: boolean
  gallery?: string[]
  deck?: string[]
  concepts?: BrandConcept[]
  social?: BrandSocial
}

export interface BrandItem {
  key: string
  title: string
  tag: string
  accent: string
  image?: string
  description: string
  format: string
  externalUrl?: string
  comingSoon?: boolean
  gallery?: string[]
  /** Ordered pitch-deck slides (site-root WebP under public/brands/), shown by
   * the VIEW DECK viewer on the brand detail page. */
  deck?: string[]
  /** Three heading+body pairs from the design file's per-brand deck ("THE
   * SERIES · ..." info cards) — seaside/inside/outside only; highrise/
   * soundcheck use the slide-deck format instead. */
  concepts?: BrandConcept[]
  /** This brand's own verified accounts, when any have been confirmed. */
  social?: BrandSocial
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

function mapBrands(raw: BrandItemRaw[]): BrandItem[] {
  return raw.map((b) => ({
    ...b,
    gallery: b.gallery?.map(normalizePath),
    deck: b.deck?.map(normalizePath),
  }))
}

/**
 * The parent LUPFR deck (the portfolio story: one brand, five worlds), shown on
 * the /brands index. Not in brands.yml — LUPFR is the parent, not a sub-brand.
 */
export const LUPFR_DECK: string[] = [1, 2, 3, 4, 5].map((n) => `/brands/lupfr-deck-${n}.webp`)

export const BRANDS: BrandItem[] = mapBrands(brandsJson as BrandItemRaw[])

export function getBrands(): BrandItem[] {
  return BRANDS
}

/**
 * The two operating divisions, same grouping/keys/copy as `components/brand-tree.tsx`'s
 * corporate-structure diagram — reused here (owner design-file punch list,
 * 2026-09-02: "operating tab keeps the poster grid with division dividers") so
 * the home Our Brands operating tab groups its cards by division instead of
 * introducing a second, differently-worded grouping concept.
 */
export const LIVE_EVENTS_BRAND_KEYS = ["seaside", "inside", "outside"] as const
export const CORPORATE_MEDIA_BRAND_KEYS = ["highrise", "soundcheck"] as const

/** Brands split into the two operating divisions, each in its own YAML order. */
export function getBrandsByDivision(): { liveEvents: BrandItem[]; corporateMedia: BrandItem[] } {
  const byKey = new Map(BRANDS.map((b) => [b.key, b]))
  const liveEvents = LIVE_EVENTS_BRAND_KEYS.map((k) => byKey.get(k)).filter((b): b is BrandItem => !!b)
  const corporateMedia = CORPORATE_MEDIA_BRAND_KEYS.map((k) => byKey.get(k)).filter((b): b is BrandItem => !!b)
  return { liveEvents, corporateMedia }
}

/**
 * The five company-wide "platform" programs — from the owner's design-canvas
 * data ("Our Brands Ideas.dc.html"'s `platforms[]` array, "LUPFR Website
 * Design v3"), real owner-authored copy, not fabricated. No background photos
 * are included: none were supplied in that source for these five cards, so
 * the PLATFORM tab renders them as flat bordered panels rather than guessing
 * at imagery (see docs/CHANGELOG.md, 2026-09-02).
 */
export interface PlatformProgram {
  num: string
  name: string
  line: string
}

export const PLATFORM_PROGRAMS: PlatformProgram[] = [
  { num: "06", name: "LUPFR VIP", line: "Membership tier — early access, tables, hosted invites." },
  { num: "07", name: "LUPFR Promoter Program", line: "Promoters host their own nights on our infrastructure." },
  { num: "08", name: "LUPFR Media", line: "In-house content studio — recaps, film, editorial." },
  { num: "09", name: "LUPFR Hospitality", line: "Venue partnerships and resident programming." },
  { num: "10", name: "LUPFR Ventures", line: "Capital and concepts across nightlife and hospitality." },
]

/** Dedicated per-brand detail route (`/brands/<key>`); slug = the YAML `key`. */
export function brandPath(brand: Pick<BrandItem, "key">): string {
  return `/brands/${brand.key}`
}

export function getBrandBySlug(slug: string): BrandItem | undefined {
  return BRANDS.find((b) => b.key === slug)
}

/**
 * Plain-text wordmark for `<title>`/aria contexts that can't render `BrandSlashText`
 * (e.g. "SEA//SIDE" → "SEA SIDE"): collapses the "//" divider to a single space
 * instead of the styled skewed span used everywhere else.
 */
export function brandPlainTitle(brand: Pick<BrandItem, "title">): string {
  return brand.title
    .split("//")
    .map((part) => part.trim())
    .join(" ")
}
