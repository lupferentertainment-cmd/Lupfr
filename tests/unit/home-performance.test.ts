import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const homePagePath = path.join(rootDir, "components", "home-page.tsx")
const deferredSectionPath = path.join(rootDir, "components", "deferred-home-section.tsx")
const artistsPath = path.join(rootDir, "components", "artists.tsx")
const heroMobilePath = path.join(rootDir, "components", "hero-mobile-static.tsx")
const scheduleCallCtaPath = path.join(rootDir, "components", "schedule-call-cta.tsx")
const eventsPath = path.join(rootDir, "components", "events.tsx")
const motionProviderPath = path.join(rootDir, "components", "motion-provider.tsx")
const layoutPath = path.join(rootDir, "app", "layout.tsx")
const liquidMetalCanvasPath = path.join(rootDir, "components", "liquid-metal-canvas.tsx")

/** Initial-chunk modules that must use LazyMotion `m`, not the full `motion` proxy. */
const INITIAL_CHUNK_M_MODULES = [
    "scroll-reveal.tsx",
    "gold-shine-text.tsx",
    "scroll-progress.tsx",
    // services.tsx/brands.tsx (owner restructure, 2026-08-28: poster-tile grid)
    // no longer import `m` directly — the per-tile reveal animation now lives
    // in the shared poster-tile.tsx module both sections render.
    "poster-tile.tsx",
    "events.tsx",
    "artists.tsx",
    "phone-list-popup.tsx",
] as const

describe("home page mobile transfer guardrails", () => {
    const homePage = fs.readFileSync(homePagePath, "utf8")
    const deferredSection = fs.readFileSync(deferredSectionPath, "utf8")
    const artists = fs.readFileSync(artistsPath, "utf8")
    const heroMobile = fs.readFileSync(heroMobilePath, "utf8")
    const scheduleCallCta = fs.readFileSync(scheduleCallCtaPath, "utf8")
    const events = fs.readFileSync(eventsPath, "utf8")

    it("defers lower home sections behind hash-preserving placeholders", () => {
        // The deferred-section component lives in its own module so tests (and the
        // coverage denominator) don't drag in the whole home component graph.
        expect(deferredSection).toContain("export function DeferredHomeSection")
        expect(deferredSection).toContain("IntersectionObserver")
        expect(deferredSection).toContain("window.location.hash")
        expect(deferredSection).toContain("aria-hidden=\"true\"")
        expect(deferredSection).toContain('DEFERRED_SECTION_ROOT_MARGIN_MOBILE = "900px 0px"')
        expect(homePage).toContain('import { DeferredHomeSection } from "@/components/deferred-home-section"')
        expect(homePage).not.toContain('<DeferredHomeSection id="services"')
        expect(homePage).not.toContain("id=\"gallery\"")
        expect(homePage).toContain("id=\"about\"")
        expect(homePage).toContain("id=\"team\"")
        expect(homePage).toContain("id=\"contact\"")
    })

    it("has no standalone Press section — the press card lives inside About (owner restructure 2026-07-17)", () => {
        expect(homePage).not.toContain('<DeferredHomeSection id="news"')
        expect(homePage).not.toContain("<Press />")
        const about = fs.readFileSync(path.join(rootDir, "components", "about.tsx"), "utf8")
        expect(about).toContain('getPress()[0]')
    })

    it("mounts the events section eagerly so #events navigation is instant", () => {
        expect(homePage).toContain('import { Events } from "@/components/events"')
        expect(homePage).toContain("<Events />")
        expect(homePage).not.toContain('<DeferredHomeSection id="events"')
    })

    it("only realigns deferred hash targets when the mounted section still owns the current hash", () => {
        // Realignment is a bounded rAF loop instead of a fixed ladder of setTimeouts...
        expect(deferredSection).toContain("realignHashTargetUntilStable")
        expect(deferredSection).not.toContain("HASH_REALIGN_DELAYS_MS")
        // ...which stops the moment the hash stops targeting the mounted section.
        const hashScroll = fs.readFileSync(path.join(rootDir, "lib", "hash-scroll.ts"), "utf8")
        expect(hashScroll).toContain("if (hashToId(getHash()) !== id) return stop()")
    })

    it("mounts deferred sections at or above the hash target so the target lands stably", () => {
        expect(deferredSection).toContain("deferredSectionShouldMountForHash")
    })

    it("mounts the services section eagerly so fast scrolling from events never lands on a blank deferred placeholder", () => {
        expect(homePage).toContain('import { Services } from "@/components/services"')
        expect(homePage).toContain("<Services />")
        expect(homePage).not.toContain('<DeferredHomeSection id="services"')
    })

    it("mounts the brands section eagerly, just under the partners strip and news", () => {
        expect(homePage).toContain('import { Brands } from "@/components/brands"')
        // The guardrail here is *eager* mounting — fast scrolling from the top
        // must never land on a blank deferred placeholder. The owner's News
        // strip (2026-08-08) sits between the partners marquee and Brands, so
        // the order allows it while the eager-mount contract stays exact.
        // News is a short, image-free text list, so it does not reintroduce the
        // above-the-fold cost this suite exists to bound; the mobile-perf
        // budgets in verify-mobile-perf remain the enforcing gate.
        expect(homePage).toMatch(/<PartnersStrip \/>[\s\S]*?<News \/>\s*<Brands \/>\s*<Events \/>/)
        expect(homePage).not.toContain('<DeferredHomeSection id="brands"')
        expect(homePage).not.toContain('<DeferredHomeSection id="news"')
    })

    it("keeps lazy home placeholders compact so scrolling between sections stays short", () => {
        // The About/Team heights now live in shared ABOUT_MIN_HEIGHT/TEAM_MIN_HEIGHT
        // constants (2026-08-29 black-screen fix, see docs/DESIGN.md Phase 45) so the
        // DeferredHomeSection placeholder and the dynamic() loading fallback can never
        // drift apart — assert the constant's own value instead of an inline literal.
        expect(homePage).not.toContain('estimatedHeightClassName="min-h-[640px] sm:min-h-[820px]"')
        expect(homePage).toMatch(/const ABOUT_MIN_HEIGHT = "min-h-\[1100px\] lg:min-h-\[640px\]"/)
        expect(homePage).toContain("estimatedHeightClassName={ABOUT_MIN_HEIGHT}")
        expect(homePage).not.toContain("min-h-[1120px] sm:min-h-[980px]")
    })

    it("keeps the remaining heavyweight lower sections out of the initial server/client payload", () => {
        expect(homePage).toContain("{ ssr: false }")
        expect(homePage).toContain("<Artists />")
        expect(homePage).not.toContain("<Gallery />")
        expect(homePage).toContain("<About />")
        expect(homePage).toContain("<Contact />")
        expect(homePage).toContain("<Footer />")
    })

    it("mounts the artists section eagerly to avoid blank placeholders on fast laptop navigation", () => {
        expect(homePage).toContain('import { Artists } from "@/components/artists"')
        expect(homePage).toContain("<Artists />")
        expect(homePage).not.toContain('<DeferredHomeSection id="artists"')
        expect(homePage).not.toContain('<DeferredHomeSection\n        id="artists"')
    })

    it("loads MotionProvider with LazyMotion + domAnimation (non-strict)", () => {
        expect(fs.existsSync(motionProviderPath)).toBe(true)
        const motionProvider = fs.readFileSync(motionProviderPath, "utf8")
        expect(motionProvider).toContain("LazyMotion")
        expect(motionProvider).toContain("domAnimation")
        expect(motionProvider).toContain("export function MotionProvider")
        // Non-strict: must not pass strict to LazyMotion
        expect(motionProvider).not.toMatch(/<LazyMotion[^>]*\bstrict\b/)
        const layout = fs.readFileSync(layoutPath, "utf8")
        expect(layout).toContain("MotionProvider")
        expect(layout).not.toContain("liquid-metal-canvas")
    })

    it("uses LazyMotion m (not motion proxy) in initial-chunk modules", () => {
        for (const fileName of INITIAL_CHUNK_M_MODULES) {
            const source = fs.readFileSync(path.join(rootDir, "components", fileName), "utf8")
            expect(source, `${fileName} should import m`).toMatch(/\bimport\s*\{[^}]*\bm\b/)
            expect(source, `${fileName} should not import motion proxy`).not.toMatch(
                /\bimport\s*\{[^}]*\bmotion\b/
            )
        }
    })

    it("does not ship dead liquid-metal-canvas", () => {
        expect(fs.existsSync(liquidMetalCanvasPath)).toBe(false)
    })

    it("mounts the partners strip eagerly right under the hero (stats section retired)", () => {
        expect(homePage).toContain('import { PartnersStrip } from "@/components/partners-strip"')
        expect(homePage).toContain("<PartnersStrip />")
        expect(homePage).not.toContain("Reviews")
    })

    it("checks deferred named exports before handing them to Next dynamic", () => {
        expect(homePage).toContain("resolveDynamicComponent")
    })

    it("does not pass unchecked named exports to Next dynamic", () => {
        expect(homePage).not.toContain(".then((m) => m.")
    })

    it("keeps the mobile hero and event section from eager-loading desktop-weight work", () => {
        // Schedule a call / Watch Reel dropped from the hero (owner restructure,
        // 2026-08-28) — Book an Event + Upcoming Events are the only hero CTAs now.
        expect(heroMobile).not.toContain('from "framer-motion"')
        expect(heroMobile).not.toContain("MotionScheduleCallCta")
        expect(heroMobile).not.toContain("ScheduleCallCta")
        expect(events).toContain("prefetchDetails={isMobile === false}")
        expect(events).toContain("prioritizeFirstImage={isMobile === false}")
        expect(events).toContain("priority={prioritizeImage}")
    })

    it("serves a single priority-loaded filmstrip photo for mobile LCP (owner restructure, 2026-08-28 — no more poster+deferred video)", () => {
        expect(heroMobile).toContain("HERO_FILMSTRIP_PHOTOS")
        expect(heroMobile).toContain("priority={activeIndex === 0}")
        expect(heroMobile).not.toContain("HERO_POSTER_DARK_MOBILE")
        expect(heroMobile).not.toMatch(/HERO_POSTER_(DARK|LIGHT)\b/)
        expect(heroMobile).not.toContain("<video")
    })

    it("keeps the base schedule CTA free of Framer Motion", () => {
        expect(scheduleCallCta).not.toContain("framer-motion")
    })

    it("lazy-loads third-party music iframes without extra opt-in buttons", () => {
        expect(artists).not.toContain("isTrackLoaded")
        expect(artists).not.toContain("setIsTrackLoaded(true)")
        expect(artists).not.toContain("Load {featuredTrackLabel} player")
        expect(artists).toContain('loading="lazy"')
        expect(artists).toContain("?theme=0")
        expect(artists).toContain("visual=false")
        expect(artists).toContain("src={featuredTrackEmbedUrl}")
    })
})

describe("mobile artists black-screen regression", () => {
    const artists = fs.readFileSync(
        path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "components", "artists.tsx"),
        "utf8"
    )

    it("never mounts ScrollReveal on mobile (whileInView opacity:0 never fires on fast scroll)", () => {
        // Desktop-only entrance reveal (owner request 2026-07-11): every reveal
        // goes through ArtistsRevealShell, whose mobile branch is a plain div.
        expect(artists).toContain("function ArtistsRevealShell")
        expect(artists).toMatch(/if \(isMobile\) return <div className=\{className\}>\{children\}<\/div>/)
        // No direct (ungated) ScrollReveal usage outside the shell.
        const directUses = artists.match(/<ScrollReveal/g) ?? []
        expect(directUses).toHaveLength(1)
        expect(artists).toContain("<ArtistsRevealShell")
    })

    it("defaults isMobile to true before hydration so cards never start invisible on mobile", () => {
        expect(artists).toContain("useIsMobile() ?? true")
    })

    it("does not start cards at opacity-0 so mobile never shows a blank frame on scroll", () => {
        // scroll-triggered entrance animations removed; cards are always visible (no initial opacity:0)
        expect(artists).not.toMatch(/initial=\{\{[^}]*opacity:\s*0/)
    })

    it("skips bio backdrop-blur overlay on mobile to avoid compositor stalls that can show a black frame", () => {
        expect(artists).toContain("!isMobile &&")
        expect(artists).not.toMatch(/isMobile[\s\S]{0,20}backdrop-blur/)
    })

    it("skips 3D card tilt transforms on mobile to eliminate unused compositor layers", () => {
        // Tilt springs live in ArtistCardTiltShell, mounted only when !isMobile.
        expect(artists).toContain("function ArtistCardTiltShell")
        expect(artists).toContain("const enableTilt = !isMobile")
        expect(artists).toContain("if (enableTilt)")
        expect(artists).toContain("<ArtistCardTiltShell")
    })
})

describe("artists static grid (no carousel)", () => {
    const artists = fs.readFileSync(
        path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "components", "artists.tsx"),
        "utf8"
    )

    it("renders only the first six artist cards on home and keeps the full roster in the directory", () => {
        expect(artists).toContain("const HOME_FEATURED_ARTIST_COUNT = 6")
        expect(artists).toContain("artists.slice(0, HOME_FEATURED_ARTIST_COUNT)")
        expect(artists).toContain("items={featuredArtists}")
        expect(artists).toContain("items={visibleArtists}")
    })

    it("shows an aligned all-name roster ticker with the six featured names in metallic gold", () => {
        expect(artists).toContain('aria-label="Artist roster ticker"')
        expect(artists).toContain("roster-marquee")
        expect(artists).toContain('variant="static"')
        expect(artists).toContain("featuredArtistIds.has(artist.id)")
    })

    it("carries no Embla carousel scaffolding — no arrows, dots, or slide arrays", () => {
        expect(artists).not.toContain("@/components/ui/carousel")
        expect(artists).not.toContain("Carousel")
        expect(artists).not.toContain("CarouselDots")
        expect(artists).not.toContain("mobileArtistSlides")
        expect(artists).not.toContain("desktopArtistSlides")
        expect(artists).not.toContain("ARTISTS_PER_DESKTOP_SLIDE")
    })
})
