import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const heroDesktopPath = path.join(rootDir, "components", "hero-desktop.tsx")
const heroMobilePath = path.join(rootDir, "components", "hero-mobile-static.tsx")
const heroSharedPath = path.join(rootDir, "components", "hero-shared.tsx")
const nextConfigPath = path.join(rootDir, "next.config.mjs")

/**
 * Hero filmstrip performance guardrails (owner restructure, 2026-08-28 — the static
 * yacht poster/video is retired for a six-photo filmstrip; see docs/DESIGN.md).
 * These replace the old video-hero guardrails in this file.
 */
describe("hero filmstrip performance guardrails", () => {
    const heroDesktop = fs.readFileSync(heroDesktopPath, "utf8")
    const heroMobile = fs.readFileSync(heroMobilePath, "utf8")
    const heroShared = fs.readFileSync(heroSharedPath, "utf8")
    const nextConfig = fs.readFileSync(nextConfigPath, "utf8")

    it("no longer ships the yacht poster/video hero mechanism", () => {
        expect(heroShared).not.toContain("HERO_VIDEO_DARK")
        expect(heroShared).not.toContain("HERO_POSTER_DARK")
        expect(heroDesktop).not.toContain("<video")
        expect(heroMobile).not.toContain("<video")
    })

    it("defines exactly six filmstrip photos in the owner-specified order", () => {
        expect(heroShared).toContain("export const HERO_FILMSTRIP_PHOTOS")
        const order = ["neon-dj", "crowd", "masquerade", "band", "sunset-deck", "seaside-step-repeat"]
        const idIndexes = order.map((id) => heroShared.indexOf(`id: "${id}"`))
        for (const idx of idIndexes) expect(idx).toBeGreaterThan(-1)
        for (let i = 1; i < idIndexes.length; i++) {
            expect(idIndexes[i]).toBeGreaterThan(idIndexes[i - 1])
        }
    })

    it("only the first slat/slide is eagerly prioritized (LCP), the rest load on demand", () => {
        expect(heroDesktop).toContain("prioritize={index === 0}")
        expect(heroDesktop).toContain('fetchPriority={prioritize ? "high" : undefined}')
        expect(heroMobile).toContain("priority={activeIndex === 0}")
    })

    it("desktop filmstrip auto-advances and lets a click restart the timer, paused under reduced motion", () => {
        expect(heroDesktop).toContain("HERO_FILMSTRIP_INTERVAL_MS")
        expect(heroDesktop).toContain("autoAdvance = prefersReducedMotion !== true")
        expect(heroMobile).toContain("autoAdvance = prefersReducedMotion !== true")
    })

    it("desktop slats preview on hover, not just click (owner request 2026-08-28)", () => {
        expect(heroDesktop).toContain("onMouseEnter={() => onSelect(index)}")
        expect(heroDesktop).toContain("onClick={() => onSelect(index)}")
        expect(heroDesktop).toContain("onFocus={() => onSelect(index)}")
    })

    it("keeps every hero filmstrip photo within a lean per-image budget", () => {
        // Small per-slat budget: only one image is priority-loaded at a time, but all
        // six are visible (desktop) or swappable (mobile) above the fold.
        const heroDir = path.join(rootDir, "public", "hero")
        const files = fs.readdirSync(heroDir).filter((f) => f.startsWith("hero-slat-"))
        expect(files.length).toBeGreaterThanOrEqual(6)
        for (const file of files) {
            const { size } = fs.statSync(path.join(heroDir, file))
            expect(size, `${file} is ${size} bytes`).toBeLessThanOrEqual(400_000)
        }
    })

    it("caches public hero media with immutable headers", () => {
        expect(nextConfig).toContain('source: "/hero/:path*"')
        expect(nextConfig).toContain('key: "Cache-Control"')
        expect(nextConfig).toContain("public, max-age=31536000, immutable")
    })

    it("keeps the mobile hero framer-motion-free (matches home-performance.test.ts budget)", () => {
        expect(heroMobile).not.toContain('from "framer-motion"')
    })

    // Owner design-file punch list (2026-08-29): "make ability for me to scroll
    // through images manually too (both desktop and mobile)". Desktop already had
    // hover/click-selectable slats; this adds an explicit prev/next affordance to
    // both shells on top of that, plus a swipe gesture on mobile.
    it("both hero shells render the shared manual prev/next arrows", () => {
        expect(heroShared).toContain("export function HeroFilmstripArrows")
        expect(heroDesktop).toContain("<HeroFilmstripArrows activeIndex={activeIndex} onSelect={selectSlat} />")
        expect(heroMobile).toContain("<HeroFilmstripArrows activeIndex={activeIndex} onSelect={selectSlide} />")
    })

    it("mobile hero supports a plain touch swipe (no gesture library)", () => {
        expect(heroMobile).toContain("onTouchStart={handleTouchStart}")
        expect(heroMobile).toContain("onTouchEnd={handleTouchEnd}")
        expect(heroMobile).not.toContain("react-swipeable")
        expect(heroMobile).not.toContain("use-gesture")
    })
})
