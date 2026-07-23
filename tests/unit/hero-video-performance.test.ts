import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const heroDesktopPath = path.join(rootDir, "components", "hero-desktop.tsx")
const heroSharedPath = path.join(rootDir, "components", "hero-shared.tsx")
const nextConfigPath = path.join(rootDir, "next.config.mjs")

describe("hero video performance guardrails", () => {
    const heroDesktop = fs.readFileSync(heroDesktopPath, "utf8")
    const heroShared = fs.readFileSync(heroSharedPath, "utf8")
    const nextConfig = fs.readFileSync(nextConfigPath, "utf8")

    it("uses real event video media with a poster fallback", () => {
        expect(heroDesktop).toContain("useHeroTheme")
        expect(heroDesktop).toContain("activeVideoSrc")
        expect(heroDesktop).toContain("<HeroFallbackPoster posterSrc={activePosterSrc} />")
        expect(heroDesktop).toContain("activePosterSrc")
        expect(heroShared).toContain('export const HERO_VIDEO_DARK = "/hero/hero_yacht_001.mp4"')
        expect(heroShared).toContain('export const HERO_VIDEO_LIGHT = "/hero/hero_yacht_001.mp4"')
        expect(heroDesktop).toContain("HERO_VIDEO_DARK")
        expect(heroDesktop).toContain("HERO_VIDEO_LIGHT")
        expect(heroDesktop).toContain("hasHeroVideo")
        expect(heroDesktop).toContain("key={activeVideoSrc}")
        expect(heroDesktop).toContain("src={activeVideoSrc}")
        expect(heroDesktop).not.toContain("videoDarkRef")
        expect(heroDesktop).not.toContain("videoLightRef")
    })

    it("does not prop-drill a shine position into the hero title (phase 22 — Entertainment dropped its gradient, so there's nothing left to position)", () => {
        expect(heroDesktop).not.toContain("shinePosition")
        expect(heroDesktop).not.toContain("staticShinePositionCss")
    })

    it("falls back quickly if desktop video playback is too slow", () => {
        expect(heroDesktop).toContain("const HERO_VIDEO_SLOW_MS = 8000")
        expect(heroDesktop).toContain("VIDEO_READY_STATE_HAS_CURRENT_DATA")
        expect(heroDesktop).toContain("video.readyState >= VIDEO_READY_STATE_HAS_CURRENT_DATA")
        expect(heroDesktop).toContain('video.addEventListener("loadeddata", onVideoReady)')
        expect(heroDesktop).toContain('video.addEventListener("playing", onVideoReady)')
        expect(heroDesktop).toContain("setVideoReady(true)")
        expect(heroDesktop).toContain('videoReady ? "opacity-100" : "opacity-0"')
        expect(heroDesktop).toContain("handlePlaybackError")
        expect(heroDesktop).not.toContain(".catch(() => { })")
    })

    it("keeps the hero video within the desktop download budget", () => {
        // 9s 720p24 loop — 1.6 MB is plenty at a sane CRF; anything above is
        // wasted bandwidth on every desktop first paint.
        const videoPath = path.join(rootDir, "public", "hero", "hero_yacht_001.mp4")
        const { size } = fs.statSync(videoPath)
        expect(size).toBeLessThanOrEqual(1_600_000)
    })

    it("caches public hero media with immutable headers", () => {
        expect(nextConfig).toContain('source: "/hero/:path*"')
        expect(nextConfig).toContain('key: "Cache-Control"')
        expect(nextConfig).toContain("public, max-age=31536000, immutable")
    })
})
