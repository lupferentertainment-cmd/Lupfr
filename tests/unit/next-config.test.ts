import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const nextConfigPath = path.join(rootDir, "next.config.mjs")
const nextConfig = fs.readFileSync(nextConfigPath, "utf8")

describe("next config guardrails", () => {
  it("keeps the pages manifest fallback out of dev builds", () => {
    expect(nextConfig).toContain("if (isServer && !dev)")
  })

  it("passes the Next dev flag into the manifest guard", () => {
    expect(nextConfig).toContain("addPagesManifestGuard(config, isServer, dev)")
  })
})
