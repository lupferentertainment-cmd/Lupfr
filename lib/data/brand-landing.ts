/**
 * View-model helpers for the v16 brand landing pages (`/brands/<key>`).
 */
import { type BrandItem, getBrands } from "@/lib/data/brands"
import { getMediaOverview, type MediaChannelCell } from "@/lib/data/media"
import { LINKS } from "@/lib/links"

export interface BrandSocialLink {
  platform: string
  handle: string
  href: string
  /** True when the account belongs to LUPFR rather than the brand itself. */
  viaLupfr: boolean
}

/** "https://www.instagram.com/seaside.la/" → "@seaside.la"; falls back to the host for odd URLs. */
export function handleFromUrl(platform: MediaChannelCell["platform"], url: string): string {
  let segment = ""
  try {
    segment = new URL(url).pathname.split("/").filter(Boolean).pop() ?? ""
  } catch {
    segment = ""
  }
  if (!segment) return url
  if (platform === "Instagram" || platform === "TikTok") return segment.startsWith("@") ? segment : `@${segment}`
  return segment
}

/**
 * The accounts a brand landing's "Follow" list shows: the brand's own verified
 * accounts when it has any, otherwise LUPFR's four real channels labelled "via
 * LUPFR" — never an invented handle (see lib/data/media.ts).
 */
export function getBrandSocials(brandKey: string): BrandSocialLink[] {
  // v5 (2026-11-17): a brand's own confirmed `social` URLs win even while the
  // brand is "coming soon" (HIGH//RISE's Instagram is confirmed; the Media
  // page still shows coming-soon brands as such via lib/data/media.ts).
  const ownSocial = getBrands().find((b) => b.key === brandKey)?.social
  if (ownSocial) {
    const own = (["Instagram", "TikTok", "LinkedIn", "YouTube"] as const).flatMap((platform) => {
      const href = ownSocial[platform.toLowerCase() as keyof typeof ownSocial]
      return href ? [{ platform, handle: handleFromUrl(platform, href), href, viaLupfr: false }] : []
    })
    if (own.length > 0) return own
  }
  const row = getMediaOverview().brandRows.find((r) => r.key === brandKey)
  const own = (row?.channels ?? []).filter((c): c is MediaChannelCell & { href: string } => c.state === "live" && !!c.href)
  if (own.length > 0) {
    return own.map((c) => ({ platform: c.platform, handle: handleFromUrl(c.platform, c.href), href: c.href, viaLupfr: false }))
  }
  return [
    { platform: "Instagram", handle: "@lupfr_", href: LINKS.instagram },
    { platform: "TikTok", handle: "@lupfr_", href: LINKS.tiktok },
    { platform: "LinkedIn", handle: "LUPFR", href: LINKS.linkedin },
    { platform: "YouTube", handle: "LUPFR", href: LINKS.youtube },
  ].map((c) => ({ ...c, viaLupfr: true }))
}

/** "#rrggbb" + alpha 0–1 → "rgba(r,g,b,a)" for the CTA box tint. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "")
  const n = Number.parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/** "SEA//SIDE" → ["SEA", "SIDE"]. */
export function splitBrandTitle(title: string): [string, string] {
  const [before, after = ""] = title.split("//").map((p) => p.trim())
  return [before, after]
}

/** Every brand except `key`, in YAML order, for the "More from LUPFR" row. */
export function getOtherBrands(key: string): BrandItem[] {
  return getBrands().filter((b) => b.key !== key)
}
