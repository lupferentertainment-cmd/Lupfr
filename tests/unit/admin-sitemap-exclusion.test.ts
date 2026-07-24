import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

describe("admin sitemap exclusion", () => {
  it("excludes /admin routes from the public sitemap helper", () => {
    const sitemapSource = fs.readFileSync(path.join(rootDir, "app/sitemap.ts"), "utf8")
    expect(sitemapSource).toContain("/admin")
    expect(sitemapSource).toMatch(/route === ['"]\/admin['"]|startsWith\(['"]\/admin/)
  })
})
