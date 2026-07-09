/**
 * Mobile services cards must stay plain DOM (no per-feature m.li / card-shell
 * motion) so the section does not hydrate ~60 framer-motion nodes on phones.
 * Desktop keeps tilt + hover motion; section-level `m` import stays for LazyMotion.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const services = fs.readFileSync(path.join(rootDir, "components", "services.tsx"), "utf8")

describe("mobile services static cards", () => {
  it("keeps LazyMotion `m` import (no motion proxy) for section reveal", () => {
    expect(services).toMatch(/\bimport\s*\{[^}]*\bm\b/)
    expect(services).not.toMatch(/\bimport\s*\{[^}]*\bmotion\b/)
    expect(services).toContain("<m.div")
  })

  it("gates tilt and infinite orbs to confirmed desktop only", () => {
    expect(services).toContain("const animateOrbs = isMobile === false")
    expect(services).toContain("const enableTilt = isMobile === false")
    expect(services).toContain("if (!enableTilt)")
    expect(services).toContain("<ServiceCardTiltShell")
  })

  it("ships a plain-DOM static card body for the mobile path", () => {
    expect(services).toContain("function ServiceCardStaticBody")
    expect(services).toContain("<ServiceCardStaticBody")
    const staticBody = services.slice(
      services.indexOf("function ServiceCardStaticBody"),
      services.indexOf("function ServiceCardMotionBody"),
    )
    expect(staticBody).toContain("<li")
    expect(staticBody).toContain("<h3")
    expect(staticBody).toContain("<span")
    expect(staticBody).not.toContain("<m.")
  })

  it("keeps animated feature rows only on the desktop motion body", () => {
    expect(services).toContain("function ServiceCardMotionBody")
    expect(services).toContain("<m.li")
    expect(services).toContain("<m.span")
  })
})
