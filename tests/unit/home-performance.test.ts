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
        expect(homePage).not.toContain('<DeferredHomeSection id="news"')
        expect(homePage).not.toContain("id=\"gallery\"")
        expect(homePage).toContain("id=\"about\"")
        expect(homePage).toContain("id=\"team\"")
        expect(homePage).toContain("id=\"contact\"")
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

    it("keeps lazy home placeholders compact so scrolling between sections stays short", () => {
        expect(homePage).not.toContain('estimatedHeightClassName="min-h-[640px] sm:min-h-[820px]"')
        expect(homePage).toContain('estimatedHeightClassName="min-h-[900px] lg:min-h-[780px]"')
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
        expect(homePage).toContain("<Artists />")
        expect(homePage).not.toContain('<DeferredHomeSection\n        id="artists"')
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
        expect(heroMobile).not.toContain('from "framer-motion"')
        expect(heroMobile).not.toContain("MotionScheduleCallCta")
        expect(heroMobile).toContain("ScheduleCallCta")
        expect(events).toContain("prefetchDetails={isMobile === false}")
        expect(events).toContain("prioritizeFirstImage={isMobile === false}")
        expect(events).toContain("priority={prioritizeImage}")
    })

    it("serves the tiny mobile-only hero posters (not the 2560px desktop posters) so the phone LCP source stays small", () => {
        expect(heroMobile).toContain("HERO_POSTER_DARK_MOBILE")
        expect(heroMobile).toContain("HERO_POSTER_LIGHT_MOBILE")
        // Must not fall back to the heavy desktop posters on the mobile path.
        expect(heroMobile).not.toMatch(/HERO_POSTER_(DARK|LIGHT)\b/)
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

    it("does not wrap the artists section in ScrollReveal (whileInView opacity:0 never fires on fast scroll)", () => {
        expect(artists).not.toContain("ScrollReveal")
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
        // `noTilt = isMobile || ringed` — mobile still always skips tilt (ringed also
        // disables it on desktop so the liquid-gold ring stays aligned).
        expect(artists).toContain("const noTilt = isMobile || ringed")
        expect(artists).toContain("noTilt ? undefined : { rotateX, rotateY")
        expect(artists).toContain("if (noTilt || !cardRef.current) return")
    })
})

describe("mobile artist carousel (one-artist-per-slide)", () => {
    const artists = fs.readFileSync(
        path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "components", "artists.tsx"),
        "utf8"
    )

    it("defines a per-artist mobile slide array so each swipe shows exactly one artist", () => {
        expect(artists).toContain("mobileArtistSlides")
        expect(artists).toContain("artists.map((a) => [a])")
    })

    it("keeps desktop slides at 6 artists per slide", () => {
        expect(artists).toContain("ARTISTS_PER_DESKTOP_SLIDE = 6")
        expect(artists).toContain("desktopArtistSlides")
    })

    it("switches the carousel between mobile and desktop slide arrays based on isMobile", () => {
        expect(artists).toContain("isMobile ? mobileArtistSlides : desktopArtistSlides")
    })

    it("renders a single ArtistCard (no grid) per slide on mobile to reduce compositor layers", () => {
        expect(artists).toContain("isMobile ? (")
        expect(artists).toContain("slide[0]")
    })
})