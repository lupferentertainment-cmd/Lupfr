/**
 * Used by verify-routes.sh: read rendered HTML, print external anchor URLs (one per line).
 * Only real navigational `<a href>` destinations are emitted (Instagram, TikTok, YouTube,
 * Partiful, Google Calendar, etc.). Internal/relative links, mailto:/tel:, and local hosts
 * are skipped so the route crawler can health-check just the outbound links a visitor can click.
 *
 * Run: bun scripts/extract-external-links.mjs <htmlFile>
 */
import fs from "node:fs"

const htmlPath = process.argv[2]
if (!htmlPath) {
  console.error("usage: bun scripts/extract-external-links.mjs <htmlFile>")
  process.exit(1)
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "local"])
const SHARE_LINK_ENDPOINTS = new Set([
  "twitter.com/intent/tweet",
  "www.facebook.com/sharer/sharer.php",
  "www.linkedin.com/sharing/share-offsite/",
])
const anchorPattern = /<a\b[^>]*?\shref\s*=\s*(["'])(.*?)\1/gi

const html = fs.readFileSync(htmlPath, "utf8")
const links = new Set()

for (const match of html.matchAll(anchorPattern)) {
  const href = (match[2] || "").trim()
  if (!href || !/^https?:\/\//i.test(href)) continue

  let resolved
  try {
    resolved = new URL(href)
  } catch {
    continue
  }

  if (LOCAL_HOSTS.has(resolved.hostname)) continue

  resolved.hash = ""
  if (SHARE_LINK_ENDPOINTS.has(`${resolved.hostname}${resolved.pathname}`)) {
    resolved.search = ""
  }
  links.add(resolved.toString())
}

Array.from(links)
  .sort((a, b) => a.localeCompare(b))
  .forEach((link) => console.log(link))
