/**
 * Media Hub (`/media`) — the company's channels, websites, and press in one
 * place, cycled per brand. Ported from the owner's July 24 restructure mockup.
 *
 * The mockup shipped placeholder socials (`@lupfr.entertainment`, `@lupfr`) and
 * invented headlines. Those are deliberately NOT used: this page links a real
 * business's real accounts, so every URL here comes from `lib/links.ts`,
 * `data/brands.yml`, or `data/press.yml`. A brand with no website simply has no
 * website row, and no per-brand handle is fabricated — the repo has none, so
 * brand tabs surface the company channels flagged via `socialsAreCompanyWide`.
 */
import { getBrands } from "@/lib/data/brands"
import { getNews } from "@/lib/data/news"
import { getPress } from "@/lib/data/press"
import { LINKS } from "@/lib/links"

export const LUPFR_MEDIA_KEY = "lupfr"

export interface MediaSocial {
  name: string
  /** Display handle, derived from the verified URL so the two cannot drift. */
  handle: string
  url: string
}

export interface MediaNews {
  source: string
  /** Human date; empty when the source has no publication date recorded. */
  date: string
  /** Raw ISO date, kept for sorting across press + company-news sources. */
  dateISO: string
  title: string
  url: string
}

export interface MediaChannel {
  key: string
  label: string
  /** Short eyebrow above the label — brand tag, or the group descriptor. */
  tagline: string
  blurb: string
  accent: string
  website?: string
  websiteLabel?: string
  socials: MediaSocial[]
  /** True when these are LUPFR's accounts shown on a brand tab, not the brand's own. */
  socialsAreCompanyWide: boolean
  news: MediaNews[]
}

/** `https://www.instagram.com/lupfr_/` → `@lupfr_`; LinkedIn keeps its path. */
function handleFromUrl(url: string, style: "at" | "path"): string {
  const path = url.replace(/^https?:\/\/(www\.)?[^/]+/, "").replace(/\/+$/, "")
  if (style === "path") return path || url
  const last = path.split("/").filter(Boolean).pop() ?? ""
  return last.startsWith("@") ? last : `@${last}`
}

const COMPANY_SOCIALS: MediaSocial[] = [
  { name: "Instagram", handle: handleFromUrl(LINKS.instagram, "at"), url: LINKS.instagram },
  { name: "LinkedIn", handle: handleFromUrl(LINKS.linkedin, "path"), url: LINKS.linkedin },
  { name: "TikTok", handle: handleFromUrl(LINKS.tiktok, "at"), url: LINKS.tiktok },
  { name: "YouTube", handle: handleFromUrl(LINKS.youtube, "path"), url: LINKS.youtube },
]

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

/**
 * Editorial coverage (`data/press.yml`) plus owner-reviewed company news
 * (`data/news.yml`, the home News strip), newest first and de-duplicated by URL
 * — the San Francisco Post feature is legitimately present in both files, and
 * the Media Hub should list it once.
 */
function pressAsNews(): MediaNews[] {
  const fromPress: MediaNews[] = getPress().map((item) => ({
    source: item.outlet,
    dateISO: item.dateISO,
    date: item.dateISO ? MONTH_YEAR.format(new Date(`${item.dateISO}T00:00:00Z`)) : "",
    title: item.title,
    url: item.url,
  }))

  const fromNews: MediaNews[] = getNews().map((item) => ({
    source: item.source,
    dateISO: item.dateISO,
    date: MONTH_YEAR.format(new Date(`${item.dateISO}T00:00:00Z`)),
    title: item.title,
    url: item.url,
  }))

  const byUrl = new Map<string, MediaNews>()
  for (const item of [...fromPress, ...fromNews]) {
    if (!byUrl.has(item.url)) byUrl.set(item.url, item)
  }

  // Both sources type dateISO as a required string, so no fallback is needed.
  return [...byUrl.values()].sort((a, b) => b.dateISO.localeCompare(a.dateISO))
}

/** Strip the brand-slash divider for plain-text contexts (`SEA//SIDE` → `SEA/SIDE`). */
function websiteLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "")
}

export function getMediaChannels(): MediaChannel[] {
  const news = pressAsNews()

  const lupfr: MediaChannel = {
    key: LUPFR_MEDIA_KEY,
    label: "LUPFR",
    tagline: "Entertainment Group",
    blurb:
      "The parent company behind five distinct music experiences across California — live events, corporate programming, and original media, produced out of Los Angeles and San Francisco.",
    accent: "#c9a869",
    socials: COMPANY_SOCIALS,
    socialsAreCompanyWide: false,
    news,
  }

  const brandChannels: MediaChannel[] = getBrands().map((brand) => ({
    key: brand.key,
    label: brand.title,
    tagline: brand.tag,
    blurb: brand.description,
    accent: brand.accent,
    ...(brand.externalUrl
      ? { website: brand.externalUrl, websiteLabel: websiteLabel(brand.externalUrl) }
      : {}),
    socials: COMPANY_SOCIALS,
    // No per-brand handles exist in the repo, so the UI must say whose these are
    // rather than implying the brand runs its own accounts.
    socialsAreCompanyWide: true,
    // Press is company-level; only the parent tab claims it.
    news: [],
  }))

  return [lupfr, ...brandChannels]
}

export const MEDIA_CHANNELS: MediaChannel[] = getMediaChannels()
