/**
 * Sub-brands data from data/brands.yml (build-time generated to generated/brands.json).
 */
import brandsJson from "@/lib/data/generated/brands.json"

export interface BrandConcept {
  heading: string
  body: string
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
