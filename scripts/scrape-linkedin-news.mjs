/**
 * On-demand LinkedIn company-page scrape (owner request 2026-08-08:
 * "just scrape it with bs4 or something ... super fast and simple and be on
 * demand").
 *
 * Fetches LUPFR's PUBLIC company page anonymously — no session cookie, no API
 * token — so no LinkedIn account is attached to the request and none can be
 * restricted. Only what LinkedIn serves logged-out visitors is available
 * (currently ~9 recent posts with full commentary), which is enough for news.
 *
 * Output is CANDIDATES, printed for review. It deliberately does NOT write
 * data/news.yml: LinkedIn captions carry promotional claims ("400MM worth of
 * Instagram Followers", "200 Person Sellout") that must not land on lupfr.com
 * unreviewed. Copy the entries you want into data/news.yml.
 *
 *   bun scripts/scrape-linkedin-news.mjs            # print candidates
 *   bun scripts/scrape-linkedin-news.mjs --json     # machine-readable
 *   bun scripts/scrape-linkedin-news.mjs --new      # only ones not already shipped
 *
 * Exits non-zero when the page yields no posts at all — that means LinkedIn
 * changed its markup or started gating the page, and silence would be worse
 * than a failure.
 */
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import YAML from "yaml"

import { parseLinkedInPosts, toNewsCandidate } from "../lib/linkedin-scrape.ts"

const COMPANY_URL = "https://www.linkedin.com/company/lupfr"
const NEWS_YML = path.join(process.cwd(), "data", "news.yml")
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

const args = new Set(process.argv.slice(2))
const asJson = args.has("--json")
const onlyNew = args.has("--new")

function shippedUrls() {
  if (!fs.existsSync(NEWS_YML)) return new Set()
  const rows = YAML.parse(fs.readFileSync(NEWS_YML, "utf8")) ?? []
  return new Set(rows.map((r) => String(r.url ?? "")))
}

async function main() {
  const res = await fetch(COMPANY_URL, {
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    redirect: "follow",
  })

  if (!res.ok) {
    console.error(`scrape-linkedin: ${COMPANY_URL} returned ${res.status}`)
    process.exit(1)
  }

  const html = await res.text()
  const posts = parseLinkedInPosts(html)

  if (posts.length === 0) {
    console.error(
      "scrape-linkedin: parsed 0 posts. LinkedIn likely changed its markup or " +
        "started gating the public company page. Re-capture " +
        "tests/fixtures/linkedin-company-page.html and update lib/linkedin-scrape.ts."
    )
    process.exit(1)
  }

  const shipped = shippedUrls()
  let candidates = posts.map(toNewsCandidate)
  if (onlyNew) {
    candidates = candidates.filter((c) => !shipped.has(c.url))
  }

  if (asJson) {
    console.log(JSON.stringify(candidates, null, 2))
    return
  }

  console.log(
    `scrape-linkedin: ${posts.length} post(s) on the public page` +
      (onlyNew ? `, ${candidates.length} not already in data/news.yml` : "") +
      "\n"
  )

  for (const c of candidates) {
    const already = shipped.has(c.url) ? "  [already shipped]" : ""
    console.log(`- source: ${c.source}${already}`)
    console.log(`  title: ${JSON.stringify(c.title)}`)
    console.log(`  url: ${c.url}\n`)
  }

  console.log(
    "Review before shipping — LinkedIn captions contain promotional claims.\n" +
      "Copy wanted entries into data/news.yml (add an id + dateISO), then run bun run ci."
  )
}

await main()
