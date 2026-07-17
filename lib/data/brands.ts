/**
 * Sub-brands data from data/brands.yml (build-time generated to generated/brands.json).
 */
import brandsJson from "@/lib/data/generated/brands.json"

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
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

function mapBrands(raw: BrandItemRaw[]): BrandItem[] {
  return raw.map((b) => ({
    ...b,
    gallery: b.gallery?.map(normalizePath),
  }))
}

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
