/**
 * Mobile services cards must stay plain DOM (no card-shell motion) so the
 * section does not hydrate framer-motion nodes on phones. Desktop keeps tilt
 * + hover motion; section-level `m` import stays for LazyMotion. Home cards
 * (both mobile/static and desktop/motion) drop the feature-bullet list and
 * icon chip (redesign parity, 2026-07-22) — features stay on `/services`
 * overview + detail pages; home cards get a gold "Learn more →" text link.
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
    expect(staticBody).toContain("<h3")
    expect(staticBody).toContain("<span")
    expect(staticBody).not.toContain("<m.")
  })

  it("drops the home-card feature list and icon chip (redesign parity — features stay on /services)", () => {
    expect(services).not.toContain("service.features")
    expect(services).not.toContain("<service.icon")
  })

  it("gives each card a gold 'Learn more →' text link at the bottom (styled text, not a nested <a>)", () => {
    const staticBody = services.slice(
      services.indexOf("function ServiceCardStaticBody"),
      services.indexOf("function ServiceCardMotionBody"),
    )
    const motionBody = services.slice(
      services.indexOf("function ServiceCardMotionBody"),
      services.indexOf("function ServiceCard(", services.indexOf("function ServiceCardMotionBody")),
    )
    expect(staticBody).toContain("Learn more →")
    expect(motionBody).toContain("Learn more →")
    expect(motionBody).toContain("<m.span")
  })
})
