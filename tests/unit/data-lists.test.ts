import { describe, expect, it } from "vitest"
import { getPress } from "@/lib/data/press"
import { getCareers } from "@/lib/data/careers"
import { getFounders, getRoster, getTeam, TEAM_TAGS } from "@/lib/data/team"

/**
 * Small YAML-backed list contracts: normalized paths and required fields, so a
 * malformed data row fails CI instead of rendering a broken card.
 */
describe("press list", () => {
  it("exposes press rows sorted newest-first with normalized image paths", () => {
    const press = getPress()
    expect(Array.isArray(press)).toBe(true)
    for (const item of press) {
      expect(item.title.length).toBeGreaterThan(0)
      expect(item.image.startsWith("/")).toBe(true)
    }
    const dates = press.map((p) => p.dateISO)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })
})

describe("careers list", () => {
  it("exposes an array of roles", () => {
    expect(Array.isArray(getCareers())).toBe(true)
  })
})

describe("team list", () => {
  it("every member has at least one valid team tag", () => {
    for (const member of getTeam()) {
      expect(member.teams.length, member.name).toBeGreaterThan(0)
      for (const tag of member.teams) {
        expect(TEAM_TAGS).toContain(tag)
      }
    }
  })

  it("images are root-relative when present; Cianna has her portrait and LA+SF tags", () => {
    const team = getTeam()
    for (const member of team) {
      if (member.image) expect(member.image.startsWith("/")).toBe(true)
    }
    const cianna = team.find((m) => m.name.includes("Cianna"))
    expect(cianna).toBeDefined()
    expect(cianna?.name).toBe("Cianna Foppoli")
    expect(cianna?.title).toBe("Marketing & Strategy Intern")
    expect(cianna?.image).toBe("/images/team/cianna.webp")
    expect(cianna?.teams.sort()).toEqual(["LA", "SF"])
  })

  it("Exec is the founders; LA and SF each have members", () => {
    const team = getTeam()
    const exec = team.filter((m) => m.teams.includes("Exec"))
    expect(exec.map((m) => m.name)).toEqual(["Will Lupfer", "Eliott"])
    expect(team.filter((m) => m.teams.includes("LA")).length).toBeGreaterThanOrEqual(3)
    expect(team.filter((m) => m.teams.includes("SF")).length).toBeGreaterThanOrEqual(1)
  })

  it("founders and roster partition the team, and every founder has a bio", () => {
    const founders = getFounders()
    const roster = getRoster()
    expect(founders.map((m) => m.name)).toEqual(["Will Lupfer", "Eliott"])
    expect(founders.length + roster.length).toBe(getTeam().length)
    expect(founders.some((m) => roster.includes(m))).toBe(false)
    for (const f of founders) {
      // The founders row shows the bio inline, so an empty one would render blank.
      expect(f.bio.length, f.name).toBeGreaterThan(80)
      expect(f.image, f.name).toBeTruthy()
    }
  })
})
