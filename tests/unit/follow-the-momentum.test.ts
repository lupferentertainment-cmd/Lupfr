/**
 * "Follow the Momentum" (owner request 2026-08-08: the About → Our Team →
 * Follow the Momentum flow, ported from the AUG 8 design file).
 *
 * The design file's version of this band is built almost entirely on
 * unverifiable copy — "six sold-out sailings on the Bay", a Downtown LA
 * HIGH//RISE launch, a LinkedIn card stamped "340 reactions · 22 comments".
 * The STRUCTURE is ported; the CONTENT may only come from verified sources.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { LINKS } from "@/lib/links"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const source = fs.readFileSync(path.join(rootDir, "components", "follow-the-momentum.tsx"), "utf8")
/**
 * Comments stripped: this component documents the design file's invented
 * claims in prose to explain why they were dropped, and scanning raw source
 * flags that explanation as if it were shipped copy.
 */
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
const homePage = fs.readFileSync(path.join(rootDir, "components", "home-page.tsx"), "utf8")

describe("Follow the Momentum placement", () => {
  it("follows Team in the owner's About → Team → Momentum order", () => {
    const team = homePage.indexOf("<Team />")
    const momentum = homePage.indexOf("<FollowTheMomentum />")
    const contact = homePage.indexOf("<Contact />")
    expect(team).toBeGreaterThan(-1)
    expect(momentum).toBeGreaterThan(team)
    expect(contact).toBeGreaterThan(momentum)
  })

  it("exposes a #momentum anchor", () => {
    expect(source).toContain('id="momentum"')
  })
})

describe("Follow the Momentum uses verified data only", () => {
  it("sources every channel URL from lib/links.ts", () => {
    for (const key of ["instagram", "linkedin", "youtube", "tiktok"] as const) {
      expect(source).toContain(`LINKS.${key}`)
    }
    // No hardcoded social URLs that could drift from the verified ones.
    const hardcoded = source.match(/https:\/\/(www\.)?(instagram|linkedin|tiktok|youtube)\.com[^"'\s]*/g)
    expect(hardcoded ?? []).toEqual([])
  })

  it("pulls its latest update from reviewed news data, not inline copy", () => {
    expect(source).toContain("getNews()")
    expect(source).toContain("newsDateLabel")
  })

  it("ships none of the design file's invented claims", () => {
    for (const claim of [
      "sold-out",
      "sold out",
      "six sailings",
      "340 reactions",
      "22 comments",
      "Downtown LA",
    ]) {
      expect(code.toLowerCase(), `invented claim "${claim}" reached the momentum band`)
        .not.toContain(claim.toLowerCase())
    }
  })

  it("invents no follower or engagement stats", () => {
    // The design file rendered {{ stat.value }} / {{ stat.label }} tiles. Repo
    // data has no such numbers, and scraped counts go stale immediately.
    expect(code).not.toMatch(/\bfollowers?\b/i)
    expect(code).not.toMatch(/\breactions?\b/i)
  })

  it("opens every outbound channel safely", () => {
    const targets = source.match(/target="_blank"/g) ?? []
    const rels = source.match(/rel="noopener noreferrer"/g) ?? []
    expect(targets.length).toBeGreaterThan(0)
    expect(rels.length).toBe(targets.length)
  })

  it("links Learn more → to the Media Hub, matching the design file's CTA", () => {
    expect(source).toMatch(/href="\/media"[\s\S]{0,220}Learn more/)
  })
})

describe("verified link sanity", () => {
  it("the LINKS entries it consumes are absolute https URLs", () => {
    for (const url of [LINKS.instagram, LINKS.linkedin, LINKS.youtube, LINKS.tiktok]) {
      expect(url).toMatch(/^https:\/\//)
    }
  })
})
