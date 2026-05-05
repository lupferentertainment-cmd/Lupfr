import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const homePagePath = path.join(rootDir, "components", "home-page.tsx")
const artistsPath = path.join(rootDir, "components", "artists.tsx")
const heroMobilePath = path.join(rootDir, "components", "hero-mobile-static.tsx")
const eventsPath = path.join(rootDir, "components", "events.tsx")

describe("home page mobile transfer guardrails", () => {
    const homePage = fs.readFileSync(homePagePath, "utf8")
    const artists = fs.readFileSync(artistsPath, "utf8")
    const heroMobile = fs.readFileSync(heroMobilePath, "utf8")
    const events = fs.readFileSync(eventsPath, "utf8")

    it("defers lower home sections behind hash-preserving placeholders", () => {
        expect(homePage).toContain("function DeferredHomeSection")
        expect(homePage).toContain("IntersectionObserver")
        expect(homePage).toContain("window.location.hash")
        expect(homePage).toContain("aria-hidden=\"true\"")
        expect(homePage).toContain("DEFERRED_SECTION_ROOT_MARGIN_MOBILE")
        expect(homePage).toContain('id="events"')
        expect(homePage).toContain("id=\"services\"")
        expect(homePage).toContain("id=\"artists\"")
        expect(homePage).toContain("id=\"gallery\"")
        expect(homePage).toContain("id=\"about\"")
        expect(homePage).toContain("id=\"contact\"")
    })

    it("keeps lazy home placeholders compact so scrolling between sections stays short", () => {
        expect(homePage).toContain('estimatedHeightClassName="min-h-[860px] sm:min-h-[980px]"')
        expect(homePage).toContain('estimatedHeightClassName="min-h-[740px] sm:min-h-[820px]"')
        expect(homePage).toContain('estimatedHeightClassName="min-h-[620px] sm:min-h-[700px]"')
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

    it("keeps the mobile hero and event section from eager-loading desktop-weight work", () => {
        expect(heroMobile).not.toContain('from "framer-motion"')
        expect(heroMobile).not.toContain("MotionScheduleCallCta")
        expect(heroMobile).toContain("ScheduleCallCta")
        expect(events).toContain("prefetchDetails={isMobile === false}")
        expect(events).toContain("prioritizeFirstImage={isMobile === false}")
        expect(events).toContain("priority={prioritizeImage}")
    })

    it("does not create third-party music iframes until a visitor opts in", () => {
        expect(artists).toContain("isTrackLoaded")
        expect(artists).toContain("setIsTrackLoaded(true)")
        expect(artists).toContain("Load {featuredTrackLabel} player")
        expect(artists).toContain("src={featuredTrackEmbedUrl}")
    })
})