/**
 * Company news from data/news.yml (build-time generated to generated/news.json).
 *
 * Shown in the home-page News strip below the Hero (owner request 2026-08-08).
 * Every item links to a real permalink — see the header note in data/news.yml
 * for why unverifiable design-file entries were not shipped.
 */
import newsJson from "@/lib/data/generated/news.json"

export interface NewsItem {
  id: number
  source: string
  dateISO: string
  title: string
  url: string
  /** false hides this item from the /media "News & Updates" feed while it
   *  still shows in the home-page News strip; omitted/true = shown everywhere
   *  (see data/news.yml's doc comment). */
  showOnMedia?: boolean
  /** false keeps this item out of the home-page news surfaces (strip, "LUPFR
   *  in the News", Follow the Momentum) while it still leads /media; omitted/
   *  true = shown everywhere. */
  showOnHome?: boolean
  /** Optional highlight colour for this item's source chip + arrow on /media (default gold). */
  accent?: string
  /** Optional background photo for the home "LUPFR in the News" lead card
   *  (components/claude-home-media.tsx) — see data/news.yml's doc comment.
   *  Site-root path under public/. */
  image?: string
}

/** Newest first. */
export const NEWS: NewsItem[] = (newsJson as NewsItem[])
  .slice()
  .sort((a, b) => b.dateISO.localeCompare(a.dateISO))

export function getNews(): NewsItem[] {
  return NEWS
}

/** Newest first, minus items flagged `showOnHome: false` — the home-page surfaces use this. */
export function getHomeNews(): NewsItem[] {
  return NEWS.filter((n) => n.showOnHome !== false)
}

/** "AUG 7, 2026" — the design file's mono date treatment, in UTC so the
 *  rendered string cannot drift by a day with the server's timezone. */
export function newsDateLabel(item: NewsItem): string {
  return new Date(`${item.dateISO}T00:00:00Z`)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase()
}
