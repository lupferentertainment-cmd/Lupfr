import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const heroDesktopPath = path.join(rootDir, "components", "hero-desktop.tsx")
const nextConfigPath = path.join(rootDir, "next.config.mjs")

describe("hero video performance guardrails", () => {
    const heroDesktop = fs.readFileSync(heroDesktopPath, "utf8")
    const nextConfig = fs.readFileSync(nextConfigPath, "utf8")

    it("loads only the active theme video over the poster", () => {
        expect(heroDesktop).toContain("useTheme")
        expect(heroDesktop).toContain("activeVideoSrc")
        expect(heroDesktop).toContain("<HeroFallbackPoster posterSrc={activePosterSrc} />")
        expect(heroDesktop).toContain("activePosterSrc")
        expect(heroDesktop).toContain("key={activeVideoSrc}")
        expect(heroDesktop).toContain("src={activeVideoSrc}")
        expect(heroDesktop).not.toContain("videoDarkRef")
        expect(heroDesktop).not.toContain("videoLightRef")
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

    it("caches public hero media with immutable headers", () => {
        expect(nextConfig).toContain('source: "/hero/:path*"')
        expect(nextConfig).toContain('key: "Cache-Control"')
        expect(nextConfig).toContain("public, max-age=31536000, immutable")
    })
})
