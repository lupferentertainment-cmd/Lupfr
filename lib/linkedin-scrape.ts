/**
 * Parser for LUPFR's ANONYMOUS public LinkedIn company page.
 *
 * Owner request 2026-08-08: "just scrape it with bs4 or something ... super
 * fast and simple and be on demand". No session cookie and no API token are
 * used, so no LinkedIn account is attached to the request and none can be
 * restricted — the trade-off is that only what LinkedIn serves to logged-out
 * visitors is available (currently ~10 recent posts with full commentary).
 *
 * Deliberately regex-based rather than a DOM library: the input is one known
 * page shape, this runs in a build/CLI context, and adding a parser dependency
 * for a single scrape would be the heavier option. If LinkedIn's markup drifts,
 * `parseLinkedInPosts` returns fewer/no cards and the CLI reports that loudly
 * instead of silently emitting nothing.
 *
 * Output is CANDIDATES only. LinkedIn captions carry promotional claims
 * ("400MM worth of Instagram Followers") that must not reach lupfr.com
 * unreviewed — see docs/REQUIREMENTS.md → Third-party consent for why this site
 * holds a hard line on unverified copy.
 */

export interface ScrapedPost {
  /** LinkedIn activity id, e.g. "7491887612954267650". */
  activityId: string
  /** Canonical permalink to this specific post. */
  url: string
  /** Post commentary, tag-free and HTML-unescaped. */
  text: string
}

export interface NewsCandidate {
  source: string
  title: string
  url: string
  /** Always false — a human decides what ships. */
  reviewed: boolean
}

const MAX_TITLE = 200

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#x27": "'",
  "#x2F": "/",
}

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, code: string) => {
    const named = ENTITIES[code]
    if (named !== undefined) return named
    if (code.startsWith("#x") || code.startsWith("#X")) {
      const n = Number.parseInt(code.slice(2), 16)
      return Number.isNaN(n) ? whole : String.fromCodePoint(n)
    }
    if (code.startsWith("#")) {
      const n = Number.parseInt(code.slice(1), 10)
      return Number.isNaN(n) ? whole : String.fromCodePoint(n)
    }
    return whole
  })
}

function stripTags(input: string): string {
  return input.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
}

/** "…/posts/lupfr_slug-activity-7491887612954267650-X8u9" → the numeric id. */
function activityIdFromUrl(url: string): string | null {
  return /activity-(\d+)/.exec(url)?.[1] ?? null
}

/**
 * Extracts each post's commentary and its own permalink.
 *
 * Pairing matters: cards are matched as whole blocks so a post's text and its
 * link come from the same card. Scanning for all texts and all hrefs
 * independently and zipping them is how these scrapers silently mis-attribute
 * quotes to the wrong post.
 */
export function parseLinkedInPosts(html: string): ScrapedPost[] {
  if (!html) return []

  const posts: ScrapedPost[] = []
  const seen = new Set<string>()

  // Card layout is: permalink anchor, then the commentary paragraph. So each
  // commentary belongs to the nearest link that PRECEDES it, and each link is
  // consumed once.
  //
  // "Nearest link in either direction" is the tempting shortcut and it is
  // wrong: it happily reaches forward into the NEXT card and attributes a
  // post's text to an unrelated permalink. That produced headlines linking to
  // the wrong LinkedIn post until the slug/text cross-check below caught it.
  //
  // Some commentaries have no unconsumed link before them (reshared posts
  // quoted inside another card). Those are skipped rather than guessed at.
  const commentaries: Array<{ index: number; raw: string }> = []
  const commentaryRe =
    /(?:main-feed-activity-card__commentary|attributed-text-segment-list__content)[^>]*>([\s\S]*?)<\/p>/g
  for (let m = commentaryRe.exec(html); m; m = commentaryRe.exec(html)) {
    commentaries.push({ index: m.index, raw: m[1] })
  }

  const links: Array<{ index: number; url: string }> = []
  const linkRe = /href="(https:\/\/[a-z.]*linkedin\.com\/posts\/[^"]*activity-\d+[^"]*)"/g
  for (let m = linkRe.exec(html); m; m = linkRe.exec(html)) {
    links.push({ index: m.index, url: decodeEntities(m[1]).replace(/\?.*$/, "") })
  }

  const consumed = new Set<number>()

  for (const { index, raw } of commentaries) {
    let chosen = -1
    for (let j = 0; j < links.length; j++) {
      if (consumed.has(j)) continue
      if (links[j].index >= index) break
      chosen = j
    }
    if (chosen === -1) continue

    const link = links[chosen]
    const activityId = activityIdFromUrl(link.url)
    if (!activityId || seen.has(activityId)) continue

    const text = decodeEntities(stripTags(raw))
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
    if (!text) continue

    consumed.add(chosen)
    seen.add(activityId)
    posts.push({ activityId, url: link.url, text })
  }

  return posts
}

/** First line/sentence of a post, trimmed to a headline a reviewer can scan. */
export function toNewsCandidate(post: ScrapedPost): NewsCandidate {
  const firstLine = post.text.split("\n").map((l) => l.trim()).find(Boolean) ?? post.text

  let title = firstLine.replace(/\s+/g, " ").trim()
  if (title.length > MAX_TITLE) {
    const cut = title.slice(0, MAX_TITLE)
    const lastSpace = cut.lastIndexOf(" ")
    title = `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
  }

  return { source: "LinkedIn", title, url: post.url, reviewed: false }
}
