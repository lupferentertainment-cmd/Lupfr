/**
 * Used by verify-routes.sh: read HTML, print internal pathnames to crawl (one per line).
 * Run: bun scripts/extract-internal-routes.mjs <currentPath> <htmlFile>
 */
import fs from "node:fs"

const currentPath = process.argv[2] ?? "/"
const htmlPath = process.argv[3]
if (!htmlPath) {
  console.error("usage: bun scripts/extract-internal-routes.mjs <currentPath> <htmlFile>")
  process.exit(1)
}

const html = fs.readFileSync(htmlPath, "utf8")
const baseUrl = new URL(`http://local${currentPath}`)
const hrefPattern = /\bhref\s*=\s*(["'])(.*?)\1/gi
const routes = new Set()

for (const match of html.matchAll(hrefPattern)) {
  const href = (match[2] || "").trim()
  if (!href || href.startsWith("#")) continue
  if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue

  let resolved
  try {
    resolved = new URL(href, baseUrl)
  } catch {
    continue
  }

  if (resolved.origin !== "http://local") continue

  let pathname = resolved.pathname || "/"
  if (!pathname.startsWith("/")) continue
  if (pathname === "/api" || pathname.startsWith("/api/")) continue
  if (pathname === "/_next" || pathname.startsWith("/_next/")) continue
  if (pathname !== "/" && pathname.endsWith("/")) pathname = pathname.slice(0, -1)
  if (/\.[A-Za-z0-9]+$/.test(pathname)) continue

  routes.add(pathname)
}

Array.from(routes)
  .sort((a, b) => a.localeCompare(b))
  .forEach((route) => console.log(route))
