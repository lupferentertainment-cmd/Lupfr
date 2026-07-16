import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const eventsSource = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")
const artistsSource = fs.readFileSync(path.join(rootDir, "components", "artists.tsx"), "utf8")

/**
 * Event cards must render as one uniform shape in both carousels (owner
 * request 2026-07-11): equal heights regardless of copy length, meta row
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
        expect(eventsSource).toContain("shadow-xl flex flex-col h-full")
    })

    it("pins the date/time/location meta grid to the card bottom", () => {
        expect(eventsSource).toMatch(/grid grid-cols-2 gap-5 sm:gap-6 mt-auto/)
    })

    it("keeps the poster region a fixed height so image bands align across cards", () => {
        expect(eventsSource).toContain('h-[220px] sm:h-[280px] md:h-[260px] lg:h-[280px]')
    })

    it("renders the comp's corner-bracket accent in the poster region (owner redesign 2026-07-16)", () => {
        expect(eventsSource).toMatch(/border-b border-l border-foreground\/50/)
    })
})

describe("artist card shape guardrails", () => {
    it("lets artist carousel slides stretch (flex, no h-full) so cards match across slides", () => {
        expect(artistsSource).toContain('className="pl-4 md:pl-6 basis-full flex"')
        expect(artistsSource).not.toContain('basis-full h-full')
    })

    it("stretches the card shells and body so embed-less cards match embed cards", () => {
        // Both article shells fill the stretched slide…
        expect(artistsSource.match(/h-full w-full flex flex-col rounded-sm bg-card overflow-hidden/g)).toHaveLength(2)
        // …and the content block absorbs the leftover height.
        expect(artistsSource).toContain('className="flex-1 p-4 md:p-5 rounded-b-sm bg-card"')
    })
})
