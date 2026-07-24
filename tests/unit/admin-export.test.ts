import { afterEach, describe, expect, it } from "vitest"
import {
  ADMIN_EXPORT_RESOURCES,
  artistGenreBreakdown,
  buildAdminExport,
  eventStatusBreakdown,
  getAdminContactsSheetUrl,
  isAdminExportResource,
  rowsToCsv,
} from "@/lib/admin-export"

describe("lib/admin-export", () => {
  const originalSheetUrl = process.env.ADMIN_CONTACTS_SHEET_URL

  afterEach(() => {
    if (originalSheetUrl === undefined) delete process.env.ADMIN_CONTACTS_SHEET_URL
    else process.env.ADMIN_CONTACTS_SHEET_URL = originalSheetUrl
  })

  it("lists supported export resources", () => {
    expect(ADMIN_EXPORT_RESOURCES).toEqual(
      expect.arrayContaining(["events", "artists", "services", "brands", "partners"])
    )
    expect(isAdminExportResource("events")).toBe(true)
    expect(isAdminExportResource("payments")).toBe(false)
  })

  it("escapes CSV fields with commas and quotes", () => {
    const csv = rowsToCsv(
      ["name", "note"],
      [
        { name: "A", note: 'hello, "world"' },
        { name: "B", note: "line\nbreak" },
        { name: "C", note: null },
      ]
    )
    expect(csv.split("\n")[0]).toBe("name,note")
    expect(csv).toContain('"hello, ""world"""')
    expect(csv).toContain('"line\nbreak"')
    expect(csv).toContain("C,")
  })

  it("builds events export with upcoming/past status from live helpers", () => {
    const { filename, csv, rowCount } = buildAdminExport("events")
    expect(filename).toMatch(/^lupfr-events-.*\.csv$/)
    expect(rowCount).toBeGreaterThan(0)
    expect(csv).toContain("slug,title,dateISO,status")
    expect(csv).toMatch(/upcoming|past/)
  })

  it("builds artists export including genre", () => {
    const { filename, csv, rowCount } = buildAdminExport("artists")
    expect(filename).toMatch(/^lupfr-artists-.*\.csv$/)
    expect(rowCount).toBeGreaterThan(0)
    expect(csv).toContain("name,genre,instagram")
  })

  it("builds services, brands, and partners exports", () => {
    for (const resource of ["services", "brands", "partners"] as const) {
      const { filename, csv, rowCount } = buildAdminExport(resource)
      expect(filename).toMatch(new RegExp(`^lupfr-${resource}-.*\\.csv$`))
      expect(rowCount).toBeGreaterThan(0)
      expect(csv.split("\n").length).toBeGreaterThan(1)
    }
  })

  it("summarizes event status and artist genres for charts", () => {
    const status = eventStatusBreakdown()
    expect(status.map((s) => s.name)).toEqual(["Upcoming", "Past"])
    expect(status.every((s) => s.count >= 0)).toBe(true)

    const genres = artistGenreBreakdown()
    expect(genres.length).toBeGreaterThan(0)
    expect(genres[0]?.count).toBeGreaterThan(0)
  })

  it("reads optional ADMIN_CONTACTS_SHEET_URL", () => {
    delete process.env.ADMIN_CONTACTS_SHEET_URL
    expect(getAdminContactsSheetUrl()).toBeNull()
    process.env.ADMIN_CONTACTS_SHEET_URL = "https://docs.google.com/spreadsheets/d/example"
    expect(getAdminContactsSheetUrl()).toBe("https://docs.google.com/spreadsheets/d/example")
  })

  it("rejects unknown resources", () => {
    expect(() => buildAdminExport("not-a-resource" as "events")).toThrow(/unknown/i)
  })
})

