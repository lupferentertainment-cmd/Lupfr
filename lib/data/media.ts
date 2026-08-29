/**
 * News & Media (`/media`) — rebuilt 2026-08-29 (owner punch list: "Add News
 * tab back in; Pull exact News/Media sub-page from claude file") to match
 * `LUPFR_Restructure.dc.html`'s `isMediaPage` layout: a combined news feed
 * plus a "follow each brand" channel matrix, instead of the earlier
 * per-brand tab UI this file used to back.
 *
 * The design file's own channel matrix invents specific per-brand handles
 * (`@SEASIDE.LA`, a `highrise-co` LinkedIn page, etc.) — some marked "LIVE"
 * for brands `data/brands.yml` itself flags `comingSoon: true`. This is a
 * real business, so none of that ports: every URL here comes from
 * `lib/links.ts`, `data/brands.yml`, or `data/press.yml`/`data/news.yml`.
 * Where a brand has no verified account of its own, its row honestly says
 * so — routed "via" LUPFR's real account, or "soon" for a brand that hasn't
 * launched yet — rather than inventing a handle.
 *
 * Per-platform, not all-or-nothing (owner-confirmed real handles, 2026-08-29:
 * "SEA//SIDE's IG is @seaside.la and then the tiktok is the same"): a brand
 * can have its own verified account on some platforms and route the rest
 * "via" LUPFR — `data/brands.yml`'s optional `social` field drives this per
 * platform. A row's `status` reads "LIVE" the moment any one of its
 * channels is its own real account, not only when all four are.
 */
import { getBrands, type BrandItem } from "@/lib/data/brands"
import { getNews } from "@/lib/data/news"
import { getPress } from "@/lib/data/press"
import { LINKS } from "@/lib/links"

export const LUPFR_MEDIA_KEY = "lupfr"

export interface MediaNews {
  source: string
  /** Human date; empty when the source has no publication date recorded. */
  date: string
  /** Raw ISO date, kept for sorting across press + company-news sources. */
  dateISO: string
  title: string
  url: string
}

export type MediaChannelState = "live" | "via" | "soon"

export interface MediaChannelCell {
  platform: "Instagram" | "TikTok" | "LinkedIn" | "YouTube"
  state: MediaChannelState
  /** Set for "live" and "via" — the real URL to follow on that platform. */
  href?: string
}

export interface MediaBrandRow {
  key: string
  label: string
  accent: string
  status: "LIVE" | "VIA LUPFR" | "COMING SOON"
  channels: MediaChannelCell[]
}

export interface MediaStats {
  /** LUPFR + every sub-brand row shown below. */
  brandCount: number
  /** Real, verified accounts only — never a per-brand estimate. */
  liveChannelCount: number
  /** Newest real news item's human date; empty when there is no news yet. */
  updatedLabel: string
}

export interface MediaOverview {
  newsFeed: MediaNews[]
  brandRows: MediaBrandRow[]
  stats: MediaStats
}

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

/**
 * Editorial coverage (`data/press.yml`) plus owner-reviewed company news
 * (`data/news.yml`, the home News strip), newest first and de-duplicated by
 * URL — the San Francisco Post feature is legitimately present in both files,
 * and the feed should list it once.
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

const COMPANY_CHANNELS: Record<MediaChannelCell["platform"], string> = {
  Instagram: LINKS.instagram,
  TikTok: LINKS.tiktok,
  LinkedIn: LINKS.linkedin,
  YouTube: LINKS.youtube,
}

const PLATFORM_ORDER: MediaChannelCell["platform"][] = ["Instagram", "TikTok", "LinkedIn", "YouTube"]

/** Maps a channel's display platform to `BrandItem.social`'s lowercase key. */
const SOCIAL_KEY_BY_PLATFORM: Record<MediaChannelCell["platform"], keyof NonNullable<BrandItem["social"]>> = {
  Instagram: "instagram",
  TikTok: "tiktok",
  LinkedIn: "linkedin",
  YouTube: "youtube",
}

function liveRow(): MediaChannelCell[] {
  return PLATFORM_ORDER.map((platform) => ({
    platform,
    state: "live",
    href: COMPANY_CHANNELS[platform],
  }))
}

function soonRow(): MediaChannelCell[] {
  return PLATFORM_ORDER.map((platform) => ({ platform, state: "soon" }))
}

/**
 * One brand's four platform cells: a platform with a confirmed `social` URL
 * of its own is "live" with that real link; every other platform routes
 * "via" LUPFR's real account, since that's genuinely where that content
 * lives today. A `comingSoon` brand gets `soonRow()` instead — it has no
 * accounts to point anyone at yet.
 */
function brandChannels(brand: BrandItem): MediaChannelCell[] {
  if (brand.comingSoon) return soonRow()
  return PLATFORM_ORDER.map((platform) => {
    const ownHref = brand.social?.[SOCIAL_KEY_BY_PLATFORM[platform]]
    return ownHref
      ? { platform, state: "live" as const, href: ownHref }
      : { platform, state: "via" as const, href: COMPANY_CHANNELS[platform] }
  })
}

function brandStatus(brand: BrandItem, channels: MediaChannelCell[]): MediaBrandRow["status"] {
  if (brand.comingSoon) return "COMING SOON"
  return channels.some((c) => c.state === "live") ? "LIVE" : "VIA LUPFR"
}

export function getMediaOverview(): MediaOverview {
  const newsFeed = pressAsNews()
  const brands = getBrands()

  const brandRows: MediaBrandRow[] = brands.map((brand) => {
    const channels = brandChannels(brand)
    return {
      key: brand.key,
      label: brand.title,
      accent: brand.accent,
      status: brandStatus(brand, channels),
      channels,
    }
  })

  const lupfrRow: MediaBrandRow = {
    key: LUPFR_MEDIA_KEY,
    label: "LUPFR",
    accent: "#c9a869",
    status: "LIVE",
    channels: liveRow(),
  }

  const allRows = [lupfrRow, ...brandRows]

  return {
    newsFeed,
    brandRows: allRows,
    stats: {
      brandCount: brandRows.length + 1,
      // Every real, verified live channel across LUPFR + every brand row —
      // not a per-brand estimate, and not capped at LUPFR's own 4 anymore
      // now that a brand (SEA//SIDE) has confirmed accounts of its own.
      liveChannelCount: allRows.flatMap((r) => r.channels).filter((c) => c.state === "live").length,
      updatedLabel: newsFeed[0]?.date ?? "",
    },
  }
}
