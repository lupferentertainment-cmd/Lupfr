import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const publicDir = path.join(rootDir, "public")

function readPublicTextFile(relativePath: string): string {
  return fs.readFileSync(path.join(publicDir, relativePath), "utf8")
}

type ManifestIcon = {
  src?: string
  sizes?: string
  type?: string
}

type WebManifest = {
  icons?: ManifestIcon[]
}

describe("SEO discovery assets", () => {
  it("publishes robots rules with sitemap and explicit AI crawler allowances", () => {
    const robots = readPublicTextFile("robots.txt")

    expect(robots).toContain("User-agent: *")
    expect(robots).toContain("Allow: /")
    expect(robots).toContain("Disallow: /admin")
    expect(robots).toContain("Sitemap: https://lupfr.com/sitemap.xml")

    for (const bot of [
      "GPTBot",
      "OAI-SearchBot",
      "ClaudeBot",
      "Claude-User",
      "PerplexityBot",
      "Google-Extended",
    ]) {
      expect(robots).toContain(`User-agent: ${bot}`)
    }
  })

  it("ships root favicon fallbacks for cross-platform requests", () => {
    for (const iconPath of [
      "favicon.ico",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "apple-touch-icon.png",
      "favicon/favicon.ico",
      "favicon/favicon-16x16.png",
      "favicon/favicon-32x32.png",
      "favicon/apple-touch-icon.png",
    ]) {
      expect(fs.existsSync(path.join(publicDir, iconPath))).toBe(true)
    }
  })

  it("publishes llms and web manifest discovery files", () => {
    const llms = readPublicTextFile("llms.txt")
    expect(llms).toContain("https://lupfr.com/robots.txt")
    expect(llms).toContain("https://lupfr.com/sitemap.xml")

    const manifest = JSON.parse(readPublicTextFile("site.webmanifest")) as WebManifest
    const iconSources = (manifest.icons ?? []).map((icon) => icon.src)

    expect(iconSources).toContain("/favicon/android-chrome-192x192.png")
    expect(iconSources).toContain("/favicon/android-chrome-512x512.png")
  })
})
