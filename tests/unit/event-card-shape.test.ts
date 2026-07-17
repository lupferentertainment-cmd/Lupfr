import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const eventsSource = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")
const artistsSource = fs.readFileSync(path.join(rootDir, "components", "artists.tsx"), "utf8")

/**
 * Event cards must render as one uniform shape in both carousels (owner
 * request 2026-07-11): equal heights regardless of copy length, detail CTA
 * pinned to the card bottom so bottoms align. Corner radius is the sharper
 * corporate `rounded-sm`/`rounded-md` scale (owner redesign 2026-07-16,
 * replacing the earlier `rounded-2xl`/`rounded-3xl` squircle).
 */
describe("event card shape guardrails", () => {
    it("lets carousel items stretch to equal height (no explicit h-full on CarouselItem)", () => {
        // height:100% on a flex child of an auto-height row disables
        // align-items:stretch, so cards collapse to their content height.
        const carouselItemClass = eventsSource.match(/CarouselItem\s+key=\{event\.id\}\s+className="([^"]+)"/)
        expect(carouselItemClass).not.toBeNull()
        expect(carouselItemClass?.[1]).not.toContain("h-full")
        expect(carouselItemClass?.[1]).toContain("flex")
    })

    it("keeps the card article filling the stretched item", () => {
        expect(eventsSource).toContain("relative w-full overflow-hidden")
        expect(eventsSource).toContain("flex flex-col h-full")
    })

    it("pins the compact detail CTA to the card bottom", () => {
        expect(eventsSource).toMatch(/text-gold-accent mt-auto text-\[13px\]/)
    })

    it("matches the comp's square poster and 300px desktop card width", () => {
        expect(eventsSource).toContain("relative aspect-square w-full")
        // 324px slide minus the 24px left gutter = a 300px visible card.
        expect(eventsSource).toContain("md:basis-[324px]")
    })

    it("matches the comp's Upcoming/Events header and archive link", () => {
        expect(eventsSource).toContain('className="lupfr-section-kicker mb-[14px]">Upcoming')
        expect(eventsSource).toContain('href="#past-events"')
        expect(eventsSource).toContain("View all events →")
    })

    it("renders the comp's corner-bracket accent in the poster region (owner redesign 2026-07-16)", () => {
        expect(eventsSource).toMatch(/border-b border-l border-foreground\/50/)
    })
})

describe("artist card shape guardrails", () => {
    it("renders all artists in a static grid (phase 28, ported from the comp) — no carousel scaffolding", () => {
        expect(artistsSource).toContain('"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"')
        // Owner alignment pass 2026-07-17: the home grid shares the standard
        // 1400px wrapper and 24px desktop gap — no wide-section gap override.
        expect(artistsSource).not.toContain("xl:gap-16")
        expect(artistsSource).not.toContain("max-w-[1760px]")
        expect(artistsSource).not.toContain("CarouselItem")
        expect(artistsSource).not.toContain("CarouselDots")
    })

    it("stretches the card shells and body so embed-less cards match embed cards", () => {
        // Both article shells fill the stretched slide…
        expect(artistsSource.match(/h-full w-full flex flex-col rounded-sm bg-card overflow-hidden/g)).toHaveLength(2)
        // …and the content block absorbs the leftover height.
        expect(artistsSource).toContain('className="flex-1 p-4 md:p-5 rounded-b-sm bg-card"')
    })
})
