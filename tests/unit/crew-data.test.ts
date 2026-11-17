import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { CREW_EXEC, CREW_GROUPS, crewLinkLabel, crewSlug, getCrewEntries, getCrewExec, getCrewGroups, splitCrewName } from "@/lib/data/crew"

/**
 * Round 12/13 (owner handoffs v15 + v16): data contract
 * for the Our Team roster (Exec Team + five groups = 13 people (v16: Robbie removed, Will third in Operations)). Plain .test.ts so the node:fs read below isn't
 * forced under happy-dom (see homepage-redesign-scope-lock.test.ts).
 */
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

describe("crew roster data", () => {
  it("keeps the handoff's group order and member order", () => {
    expect(getCrewGroups().map((g) => g.label)).toEqual([
      "OPERATIONS",
      "BUSINESS DEVELOPMENT",
      "MEDIA TEAM",
      "LEGAL TEAM",
      "ADVISORS",
    ])
    expect(CREW_GROUPS.map((g) => g.members.map((m) => m.name))).toEqual([
      ["FredEx Entertainment", "Cube World", "Will Lupfer"],
      ["Aliyah Hyman", "Rayan Hashemy"],
      ["Yahsek Gonzalez", "Link Studios"],
      ["Eliott Nazarian"],
      ["Mike Lupfer", "Nikita Khandheria", "Kamilla Zakirzianova"],
    ])
  })

  it("puts Will and Eliott first as the Exec Team", () => {
    expect(getCrewExec()).toBe(CREW_EXEC)
    expect(CREW_EXEC).toMatchObject({ label: "EXEC TEAM", sub: "LEADERSHIP · STRATEGY · VISION", icon: "ops" })
    expect(CREW_EXEC.members.map((m) => [m.name, m.role])).toEqual([
      ["Will Lupfer", "Founder & CEO"],
      ["Eliott Nazarian", "Co-Founder, General Counsel"],
    ])
  })

  it("keeps the Exec Team's founder bios intact (Will's is the five-paragraph founder bio)", () => {
    const will = CREW_EXEC.members[0]
    expect(will.bio.split(/\n\n/)).toHaveLength(5)
    expect(will.bio).toContain("B2 Authentic LLC")
    expect(CREW_EXEC.members[1].bio).toContain("licensed attorney, actor, entrepreneur")
  })

  it("gives every group its centered sub-line", () => {
    expect(CREW_GROUPS.map((g) => g.sub)).toEqual([
      "PRODUCTION · LOGISTICS · EXECUTION",
      "PARTNERSHIPS · GREEK LIFE · MUSIC",
      "SOCIAL · CONTENT · FILM",
      "CONTRACTS · COMPLIANCE",
      "STRATEGY · OPERATIONS · HOSPITALITY",
    ])
  })

  it("every member has a short line, a full bio and a role", () => {
    const entries = getCrewEntries()
    expect(entries).toHaveLength(13)
    for (const m of entries) {
      expect(m.short.length, m.name).toBeGreaterThan(0)
      expect(m.bio.length, m.name).toBeGreaterThan(m.short.length)
      expect(m.role.length, m.name).toBeGreaterThan(0)
      expect(/^\/images\/team\/(crew\/)?[a-z0-9-]+\.webp$/.test(m.photo), `${m.name} ${m.photo}`).toBe(true)
    }
  })

  it("flattens in display order (Exec Team first) with unique ids and group context", () => {
    const entries = getCrewEntries()
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length)
    expect(entries[0]).toMatchObject({ name: "Will Lupfer", group: "EXEC TEAM", icon: "ops", id: "exec-will-lupfer" })
    expect(entries[1]).toMatchObject({ name: "Eliott Nazarian", group: "EXEC TEAM", id: "exec-eliott-nazarian" })
    // Will and Eliott appear again in their working groups, with their own ids.
    expect(entries[4]).toMatchObject({ name: "Will Lupfer", group: "OPERATIONS", id: "will-lupfer" })
    expect(entries[12]).toMatchObject({ name: "Kamilla Zakirzianova", group: "ADVISORS", icon: "adv" })
  })

  it("carries the social + website links from the v15 list, and nothing else", () => {
    const linkedin = getCrewEntries().filter((e) => e.group !== "EXEC TEAM" && e.linkedin).map((e) => e.name)
    expect(linkedin).toEqual(["Will Lupfer", "Aliyah Hyman", "Rayan Hashemy", "Eliott Nazarian", "Mike Lupfer", "Nikita Khandheria", "Kamilla Zakirzianova"])
    const instagram = getCrewEntries().filter((e) => e.group !== "EXEC TEAM" && e.instagram).map((e) => e.name)
    expect(instagram).toEqual(["Will Lupfer", "Yahsek Gonzalez", "Link Studios", "Eliott Nazarian", "Nikita Khandheria", "Kamilla Zakirzianova"])
    const websites = Object.fromEntries(getCrewEntries().filter((e) => e.link).map((e) => [e.name, e.link]))
    expect(websites).toEqual({
      "FredEx Entertainment": "https://fredexentertainment.com",
      "Cube World": "https://cubeworldproductions.com",
      "Nikita Khandheria": "https://eria.co",
      "Kamilla Zakirzianova": "https://maisonnoir.club",
    })
  })

  it("every supplied URL is https", () => {
    for (const m of getCrewEntries()) {
      for (const url of [m.link, m.linkedin, m.instagram]) {
        if (url) expect(url.startsWith("https://"), `${m.name} ${url}`).toBe(true)
      }
    }
  })

  it("splits names, slugs, and labels the website pill", () => {
    expect(splitCrewName("Kamilla Zakirzianova")).toEqual({ first: "Kamilla", last: "Zakirzianova" })
    expect(splitCrewName("Cube World")).toEqual({ first: "Cube", last: "World" })
    expect(splitCrewName("Yahsek")).toEqual({ first: "Yahsek", last: "" })
    expect(crewSlug("FredEx Entertainment")).toBe("fredex-entertainment")
    expect(crewLinkLabel({ link: "https://eria.co", linkLabel: "ERIA.CO" })).toBe("ERIA.CO")
    expect(crewLinkLabel({ link: "https://www.example.com/path" })).toBe("EXAMPLE.COM")
    expect(crewLinkLabel({ link: "not a url" })).toBe("not a url")
    expect(crewLinkLabel({})).toBe("")
  })
})

describe("crew photos", () => {
  // public/ is not part of every checkout the tests may run in, so only assert when it exists.
  const publicDir = path.join(rootDir, "public")
  it.runIf(fs.existsSync(path.join(publicDir, "images", "team")))("every team photo path exists under public/", () => {
    const missing = getCrewEntries().filter((m) => !fs.existsSync(path.join(publicDir, m.photo)))
    expect(missing.map((m) => `${m.name} → ${m.photo}`)).toEqual([])
  })
})
