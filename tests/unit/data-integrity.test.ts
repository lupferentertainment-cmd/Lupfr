import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  GALLERY_ALBUM_FOLDER_DEFAULT_DATES,
  GALLERY_HOME_ALBUM_FOLDERS,
  GALLERY_PHOTOS,
  albumBreadcrumbForFolder,
} from "@/lib/data/gallery"
import {
  EVENTS,
  getUpcomingEvents,
} from "@/lib/events"
import { PARTNERS } from "@/lib/data/partners"
import { PRESS } from "@/lib/data/press"
import { CAREERS } from "@/lib/data/careers"
import { getBlogPosts } from "@/lib/data/blog"
import { getArtists } from "@/lib/data/artists"
import { getTeam } from "@/lib/data/team"
import { getServices } from "@/lib/data/services"
import { getBrands } from "@/lib/data/brands"

function publicFileExists(urlPath: string): boolean {
  const rel = urlPath.replace(/^\//, "")
  return existsSync(join(process.cwd(), "public", ...rel.split("/")))
}

describe("data integrity (gallery ↔ events, assets on disk)", () => {
  it("every event brandTag matches a brand wordmark from data/brands.yml", () => {
    const brandTitles = new Set(getBrands().map((brand) => brand.title))
    for (const event of EVENTS) {
      if (event.brandTag === undefined) continue
      expect(brandTitles.has(event.brandTag), `event "${event.title}" brandTag "${event.brandTag}"`).toBe(true)
    }
  })

  it("default gallery folder dates reference exactly one event; breadcrumb matches event title", () => {
    const datesChecked = new Set<string>()
    for (const [folder, dateISO] of Object.entries(GALLERY_ALBUM_FOLDER_DEFAULT_DATES)) {
      if (!datesChecked.has(dateISO)) {
        datesChecked.add(dateISO)
        const matches = EVENTS.filter((e) => e.dateISO === dateISO)
        expect(
          matches.length,
          `expected exactly one event on ${dateISO} (needed for folder→title mapping)`,
        ).toBe(1)
      }
      const event = EVENTS.find((e) => e.dateISO === dateISO)
      expect(event).toBeDefined()
      expect(albumBreadcrumbForFolder(folder)).toBe(event!.title)
    }
  })

  it("every gallery image path exists under public/", () => {
    for (const p of GALLERY_PHOTOS) {
      expect(publicFileExists(p.src), `missing file for gallery row ${p.id}: ${p.src}`).toBe(true)
    }
  })

  it("home album sections have photos and a matching public/gallery/ directory", () => {
    for (const folder of GALLERY_HOME_ALBUM_FOLDERS) {
      const n = GALLERY_PHOTOS.filter((p) => p.albumFolder === folder).length
      expect(n, `GALLERY_HOME_ALBUM_FOLDERS entry "${folder}" has no photos`).toBeGreaterThan(0)
      const dir = join(process.cwd(), "public", "gallery", folder)
      expect(existsSync(dir), `missing directory for home album: public/gallery/${folder}`).toBe(true)
    }
  })

  it("every upcoming event has ticketLink or explicit TBD status", () => {
    const upcoming = getUpcomingEvents()
    const missing = upcoming.filter(
      (e) => (typeof e.ticketLink !== "string" || e.ticketLink.trim().length === 0) && e.ticketStatus !== "tbd"
    )
    for (const e of missing) {
      console.warn(
        `[data-integrity] Upcoming event has no ticketLink or ticketStatus=tbd: slug="${e.slug}" title="${e.title}".`,
      )
    }
    expect(
      missing,
      missing.length === 0
        ? ""
        : `Missing ticketLink for upcoming event(s): ${missing.map((e) => e.slug).join(", ")}. Warnings logged above.`,
    ).toEqual([])
  })

  it("event hero image paths exist under public/", () => {
    for (const e of EVENTS) {
      if (!e.image || !e.image.startsWith("/")) continue
      expect(
        publicFileExists(e.image),
        `missing event hero: ${e.title} → ${e.image}`,
      ).toBe(true)
    }
  })

  it("artist image paths exist under public/", () => {
    const missing = getArtists().filter(
      (artist) => artist.image?.startsWith("/") && !publicFileExists(artist.image)
    )
    expect(missing.map((artist) => `${artist.name} → ${artist.image}`)).toEqual([])
  })

  it("team member image paths exist under public/", () => {
    const missing = getTeam().filter(
      (member) => member.image?.startsWith("/") && !publicFileExists(member.image)
    )
    expect(missing.map((member) => `${member.name} → ${member.image}`)).toEqual([])
  })

  it("service thumbnail image paths exist under public/", () => {
    const missing = getServices().filter(
      (service) => service.image?.startsWith("/") && !publicFileExists(service.image)
    )
    expect(missing.map((service) => `${service.title} → ${service.image}`)).toEqual([])
  })

  it("brand card image paths exist under public/ (phase 24)", () => {
    const missing = getBrands().filter(
      (brand) => brand.image?.startsWith("/") && !publicFileExists(brand.image)
    )
    expect(missing.map((brand) => `${brand.title} → ${brand.image}`)).toEqual([])
  })

  it("partner logo image paths exist under public/", () => {
    const missing = PARTNERS.filter((partner) => !publicFileExists(partner.image))
    expect(missing.map((partner) => partner.name)).toEqual([])
  })

  it("press card image paths exist under public/", () => {
    const missing = PRESS.filter((item) => !publicFileExists(item.image))
    expect(missing.map((item) => item.title)).toEqual([])
  })

  it("press article links are https URLs", () => {
    const invalid = PRESS.filter((item) => !/^https:\/\//.test(item.url))
    expect(invalid.map((item) => item.title)).toEqual([])
  })

  it("career postings link to LinkedIn job pages over https", () => {
    const invalid = CAREERS.filter(
      (job) => !/^https:\/\/www\.linkedin\.com\/jobs\/view\/\d+\/?$/.test(job.linkedinUrl)
    )
    expect(invalid.map((job) => job.title)).toEqual([])
  })

  it("career postings have complete card content", () => {
    const incomplete = CAREERS.filter(
      (job) =>
        [job.title, job.location, job.type, job.workMode, job.summary].some(
          (field) => typeof field !== "string" || field.trim().length === 0
        ) || job.highlights.length === 0
    )
    expect(incomplete.map((job) => job.title)).toEqual([])
  })

  it("blog cover image paths exist under public/", () => {
    const missing = getBlogPosts().filter((post) => !publicFileExists(post.coverImage))
    expect(missing.map((post) => post.slug)).toEqual([])
  })

  it("partner dark-mode logo image paths exist under public/ when set", () => {
    const missing = PARTNERS.filter(
      (partner) => partner.imageDark && !publicFileExists(partner.imageDark)
    )
    expect(missing.map((partner) => partner.name)).toEqual([])
  })
})
