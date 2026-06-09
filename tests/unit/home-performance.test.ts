import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const homePagePath = path.join(rootDir, "components", "home-page.tsx")
const artistsPath = path.join(rootDir, "components", "artists.tsx")
const heroMobilePath = path.join(rootDir, "components", "hero-mobile-static.tsx")
const scheduleCallCtaPath = path.join(rootDir, "components", "schedule-call-cta.tsx")
const eventsPath = path.join(rootDir, "components", "events.tsx")

describe("home page mobile transfer guardrails", () => {
    const homePage = fs.readFileSync(homePagePath, "utf8")
    const artists = fs.readFileSync(artistsPath, "utf8")
    const heroMobile = fs.readFileSync(heroMobilePath, "utf8")
    const scheduleCallCta = fs.readFileSync(scheduleCallCtaPath, "utf8")
    const events = fs.readFileSync(eventsPath, "utf8")

    it("defers lower home sections behind hash-preserving placeholders", () => {
        expect(homePage).toContain("function DeferredHomeSection")
        expect(homePage).toContain("IntersectionObserver")
        expect(homePage).toContain("window.location.hash")
        expect(homePage).toContain("aria-hidden=\"true\"")
        expect(homePage).toContain('DEFERRED_SECTION_ROOT_MARGIN_MOBILE = "900px 0px"')
        expect(homePage).toContain('id="events"')
        expect(homePage).toContain("id=\"services\"")
        expect(homePage).toContain("id=\"gallery\"")
        expect(homePage).toContain("id=\"about\"")
        expect(homePage).toContain("id=\"contact\"")
    })

    it("keeps lazy home placeholders compact so scrolling between sections stays short", () => {
        expect(homePage).toContain('estimatedHeightClassName="min-h-[720px] sm:min-h-[980px]"')
        expect(homePage).toContain('estimatedHeightClassName="min-h-[640px] sm:min-h-[820px]"')
        expect(homePage).toContain('estimatedHeightClassName="min-h-[420px] sm:min-h-[700px]"')
        expect(homePage).not.toContain("min-h-[1120px] sm:min-h-[980px]")
    })

    it("keeps heavyweight lower sections out of the initial server/client payload", () => {
        expect(homePage).toContain("{ ssr: false }")
        expect(homePage).toContain("<Services />")
        expect(homePage).toContain("<Artists />")
        expect(homePage).toContain("<Gallery />")
        expect(homePage).toContain("<About />")
        expect(homePage).toContain("<Contact />")
        expect(homePage).toContain("<Footer />")
    })

    it("mounts the artists section eagerly to avoid blank placeholders on fast laptop navigation", () => {
        expect(homePage).toContain("<Artists />")
        expect(homePage).not.toContain('<DeferredHomeSection\n        id="artists"')
    })

    it("keeps immediately visible reviews out of dynamic chunk preload warnings", () => {
        expect(homePage).toContain('import { Reviews } from "@/components/reviews"')
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

    it("keeps useInView lookahead margin at least 600px so section mounts before it enters the viewport", () => {
        // margin must be "0px 0px 600px 0px" or larger — the string literal is the source of truth
        expect(artists).toMatch(/margin:\s*["']0px 0px [6-9]\d{2,}px 0px["']/)
    })

    it("skips bio backdrop-blur overlay on mobile to avoid compositor stalls that can show a black frame", () => {
        expect(artists).toContain("!isMobile &&")
        expect(artists).not.toMatch(/isMobile[\s\S]{0,20}backdrop-blur/)
    })

    it("skips 3D card tilt transforms on mobile to eliminate unused compositor layers", () => {
        expect(artists).toContain("isMobile ? undefined : { rotateX, rotateY")
        expect(artists).toContain("if (isMobile || !cardRef.current) return")
    })
})