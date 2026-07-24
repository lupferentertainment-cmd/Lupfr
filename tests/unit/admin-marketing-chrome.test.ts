import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

const chromeFiles = [
  "components/cookie-consent.tsx",
  "components/escape-back.tsx",
  "components/prefetch-home-route.tsx",
  "components/phone-list-popup.tsx",
] as const

describe("admin marketing chrome suppression", () => {
  it("skips chrome on admin.* / admin.localhost hosts (mirrors phone-list-popup)", () => {
    for (const rel of chromeFiles) {
      const source = fs.readFileSync(path.join(rootDir, rel), "utf8")
      expect(source, rel).toContain('hostname.startsWith("admin.")')
    }
  })

  it("keeps app/admin force-dynamic so runtime ADMIN_* env is not baked at build", () => {
    const layout = fs.readFileSync(
      path.join(rootDir, "app/admin/layout.tsx"),
      "utf8",
    )
    expect(layout).toContain('dynamic = "force-dynamic"')
  })
})
