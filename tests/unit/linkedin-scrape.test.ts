/**
 * LinkedIn company-page parser (owner request 2026-08-08: "just scrape it with
 * bs4 or something ... super fast and simple and be on demand").
 *
 * Parses the ANONYMOUS public company page — no session cookie, no API, so no
 * LinkedIn account is involved and none can be restricted. Tests run against a
 * real captured fixture (`tests/fixtures/linkedin-company-page.html`) so the
 * parser is verified without touching the network.
 *
 * Scraped output is treated as CANDIDATES, never as publishable copy: LinkedIn
 * captions contain promotional claims ("400MM worth of Instagram Followers")
 * that must not reach lupfr.com unreviewed. See `docs/REQUIREMENTS.md`.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  parseLinkedInPosts,
  toNewsCandidate,
  type ScrapedPost,
} from "@/lib/linkedin-scrape"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const fixture = fs.readFileSync(
  path.join(rootDir, "tests", "fixtures", "linkedin-company-page.html"),
  "utf8"
)

const posts = parseLinkedInPosts(fixture)

describe("parseLinkedInPosts", () => {
  it("finds every post card in the fixture", () => {
    expect(posts.length).toBeGreaterThanOrEqual(4)
  })

  it("extracts readable commentary text, HTML-unescaped and tag-free", () => {
    for (const p of posts) {
      expect(p.text.length, `post ${p.activityId} text`).toBeGreaterThan(10)
      expect(p.text, `post ${p.activityId} still has markup`).not.toMatch(/<[^>]+>/)
      expect(p.text, `post ${p.activityId} still has entities`).not.toMatch(/&(amp|lt|gt|quot|#\d+);/)
    }
  })

  it("pairs each post with its own canonical permalink", () => {
    for (const p of posts) {
      expect(p.url).toMatch(/^https:\/\/www\.linkedin\.com\/posts\//)
      expect(p.url).toContain(p.activityId)
    }
  })

  /**
   * Real defect this caught: pairing each commentary with the *nearest link in
   * either direction* reached forward into the next card, so post text was
   * attached to an unrelated permalink (the Partiful link carried the HIGH//RISE
   * text). Asserting `url.includes(activityId)` cannot detect that — the id is
   * derived from the url, so it is true by construction.
   *
   * LinkedIn's slug encodes the opening words of the post, which gives an
   * independent signal to cross-check text against link.
   */
  it("attributes each post's text to the matching permalink (slug cross-check)", () => {
    const slugOf = (url: string) =>
      /\/posts\/(?:lupfr_)?(.+?)-?activity-\d+/.exec(url)?.[1] ?? ""

    const checked = posts.filter((p) => slugOf(p.url).replace(/-/g, "").length > 8)
    expect(checked.length, "fixture should contain slug-bearing posts").toBeGreaterThan(0)

    for (const p of checked) {
      const slugWords = slugOf(p.url).split("-").filter((w) => w.length > 3)
      const textWords = new Set(
        p.text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean)
      )
      const overlap = slugWords.filter((w) => textWords.has(w)).length
      expect(
        overlap / Math.max(slugWords.length, 1),
        `post ${p.activityId}: slug "${slugOf(p.url)}" does not match text ` +
          `"${p.text.slice(0, 60)}…" — text is attributed to the wrong permalink`
      ).toBeGreaterThan(0.5)
    }
  })

  it("gives every post a distinct activity id", () => {
    const ids = posts.map((p) => p.activityId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("recovers the Eliott co-founder announcement", () => {
    const eliott = posts.find((p) => /Eliott Nazarian/i.test(p.text))
    expect(eliott).toBeDefined()
    expect(eliott?.text).toMatch(/Co-?Founder/i)
    expect(eliott?.url).toContain("activity-")
  })

  /**
   * LinkedIn escapes captions heavily — named entities for punctuation, numeric
   * references for smart quotes, and hex for emoji. All three must decode, and
   * anything unrecognised must be left alone rather than mangled.
   */
  it("decodes named, decimal, and hex entities in commentary", () => {
    const card =
      '<a href="https://www.linkedin.com/posts/lupfr_x-activity-123-AA">x</a>' +
      '<p class="main-feed-activity-card__commentary">' +
      "Tom &amp; Jerry &lt;3 &quot;quoted&quot; &#8217;smart&#8217; &#x1F600; &nbsp;end" +
      "</p>"
    const [post] = parseLinkedInPosts(card)
    expect(post.text).toContain("Tom & Jerry")
    expect(post.text).toContain("<3")
    expect(post.text).toContain('"quoted"')
    expect(post.text).toContain("’smart’")
    expect(post.text).toContain("\u{1F600}")
  })

  it("leaves an unrecognised entity untouched instead of corrupting it", () => {
    const card =
      '<a href="https://www.linkedin.com/posts/lupfr_x-activity-456-AA">x</a>' +
      '<p class="main-feed-activity-card__commentary">a &notarealentity; b &#xZZ; c</p>'
    const [post] = parseLinkedInPosts(card)
    expect(post.text).toContain("&notarealentity;")
    expect(post.text).toContain("&#xZZ;")
  })

  it("turns <br> into line breaks so the first line stays the headline", () => {
    const card =
      '<a href="https://www.linkedin.com/posts/lupfr_x-activity-789-AA">x</a>' +
      '<p class="main-feed-activity-card__commentary">Headline here.<br/><br/>Body copy.</p>'
    const [post] = parseLinkedInPosts(card)
    expect(post.text.split("\n")[0]).toBe("Headline here.")
    expect(toNewsCandidate(post).title).toBe("Headline here.")
  })

  it("skips a card whose commentary is empty after stripping markup", () => {
    const card =
      '<a href="https://www.linkedin.com/posts/lupfr_x-activity-321-AA">x</a>' +
      '<p class="main-feed-activity-card__commentary"><span> </span></p>'
    expect(parseLinkedInPosts(card)).toEqual([])
  })

  it("ignores a commentary with no permalink before it", () => {
    const orphan = '<p class="main-feed-activity-card__commentary">Reshared body</p>'
    expect(parseLinkedInPosts(orphan)).toEqual([])
  })

  it("returns an empty list for markup with no cards, rather than throwing", () => {
    expect(parseLinkedInPosts("<html><body><p>nothing here</p></body></html>")).toEqual([])
    expect(parseLinkedInPosts("")).toEqual([])
  })
})

describe("toNewsCandidate", () => {
  const sample: ScrapedPost = {
    activityId: "7491887612954267650",
    url: "https://www.linkedin.com/posts/lupfr_we-are-excited-activity-7491887612954267650-X8u9",
    text:
      "We are excited to announce the addition of Eliott Nazarian as Co-Founder at LUPFR.\n\n" +
      "Eliott will help shape the company's strategy, partnerships, and expansion.",
  }

  it("takes the first sentence/line as the headline and collapses whitespace", () => {
    const c = toNewsCandidate(sample)
    expect(c.title).toBe(
      "We are excited to announce the addition of Eliott Nazarian as Co-Founder at LUPFR."
    )
    expect(c.title).not.toContain("\n")
  })

  it("carries the permalink through unchanged", () => {
    expect(toNewsCandidate(sample).url).toBe(sample.url)
  })

  it("labels the source so a reviewer can see where it came from", () => {
    expect(toNewsCandidate(sample).source).toMatch(/linkedin/i)
  })

  it("truncates a long single-line post on a word boundary", () => {
    const long = { ...sample, text: "word ".repeat(80).trim() }
    const c = toNewsCandidate(long)
    expect(c.title.length).toBeLessThanOrEqual(200)
    expect(c.title).not.toMatch(/\s$/)
    // Truncation must not slice a word in half.
    expect(c.title.replace(/…$/, "").trim().endsWith("word")).toBe(true)
  })

  it("marks every candidate unreviewed so nothing auto-publishes", () => {
    expect(toNewsCandidate(sample).reviewed).toBe(false)
  })

  it("falls back to the raw text when every line is blank", () => {
    const blank = { ...sample, text: "   \n  \n " }
    // No usable first line — must not produce `undefined` in a headline.
    expect(toNewsCandidate(blank).title).toBe("")
  })

  it("hard-cuts a 200-character run with no spaces in it", () => {
    const runOn = { ...sample, text: "x".repeat(260) }
    const title = toNewsCandidate(runOn).title
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE_PLUS_ELLIPSIS)
    expect(title.endsWith("…")).toBe(true)
  })
})

const MAX_TITLE_PLUS_ELLIPSIS = 201

describe("parseLinkedInPosts de-duplication", () => {
  it("keeps only the first card when the same activity id appears twice", () => {
    const card = (body: string) =>
      '<a href="https://www.linkedin.com/posts/lupfr_x-activity-999-AA">x</a>' +
      `<p class="main-feed-activity-card__commentary">${body}</p>`
    const posts = parseLinkedInPosts(card("First copy") + card("Duplicate copy"))
    expect(posts).toHaveLength(1)
    expect(posts[0].text).toBe("First copy")
  })

  it("ignores a posts link that carries no activity id", () => {
    const html =
      '<a href="https://www.linkedin.com/posts/lupfr_no-id-here">x</a>' +
      '<p class="main-feed-activity-card__commentary">Body</p>'
    expect(parseLinkedInPosts(html)).toEqual([])
  })

  it("strips tracking query strings from the permalink", () => {
    const html =
      '<a href="https://www.linkedin.com/posts/lupfr_x-activity-555-AA?utm_source=share&amp;x=1">x</a>' +
      '<p class="main-feed-activity-card__commentary">Body</p>'
    expect(parseLinkedInPosts(html)[0].url).toBe(
      "https://www.linkedin.com/posts/lupfr_x-activity-555-AA"
    )
  })
})
