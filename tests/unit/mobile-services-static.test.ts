/**
 * Home Services tease (owner restructure, 2026-08-28: "the tiles are more
 * open on homepage" — poster-tile grid, same photo-forward treatment as
 * Our Brands, replacing the tilt/orb card shells). The redesign is lighter
 * than the old architecture by construction (no continuous animated orbs, no
 * per-card mouse-tilt springs), so there is no separate mobile/desktop card
 * body to gate — these guardrails just confirm that stayed true.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const services = fs.readFileSync(path.join(rootDir, "components", "services.tsx"), "utf8")
const posterTile = fs.readFileSync(path.join(rootDir, "components", "poster-tile.tsx"), "utf8")

describe("home services tease (poster-tile)", () => {
  it("renders the home tease through the shared, image-forward PosterTile component", () => {
    expect(services).toContain('import { PosterTile } from "@/components/poster-tile"')
    expect(services).toContain("<PosterTile")
  })

  it("renders all six services on the home page (owner correction, 2026-08-28)", () => {
    expect(services).toContain("services.map((service, i)")
    expect(services).not.toContain("services.slice(")
  })

  it("drops the old per-card mouse-tilt shell and infinite background orbs", () => {
    expect(services).not.toContain("ServiceCardTiltShell")
    expect(services).not.toContain("useMotionValue")
    expect(services).not.toContain("repeat: Infinity")
  })

  it("drops the home-card feature list and icon chip (features stay on /services)", () => {
    expect(services).not.toContain("service.features")
    expect(services).not.toContain("<service.icon")
  })

  it("gives each tile a gold 'Learn more' CTA rendered by PosterTile", () => {
    expect(services).toContain('ctaLabel="Learn more"')
    expect(posterTile).toContain("{ctaLabel}")
  })
})
