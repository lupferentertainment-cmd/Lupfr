/**
 * LUPFR team from data/team.yml (build-time generated to generated/team.json).
 */
import teamJson from "@/lib/data/generated/team.json"

export const TEAM_TAGS = ["LA", "SF", "Exec"] as const

export type TeamTag = (typeof TEAM_TAGS)[number]

export interface TeamStat {
  value: string
  label: string
}

export interface TeamMember {
  name: string
  title: string
  location: string
  /** Omitted while a portrait is pending; cards render a placeholder. */
  image?: string
  /** Paragraphs separated by a blank line in YAML render as separate <p>s (founder cards only). */
  bio: string
  /** Pull quote shown on founder cards only (owner restructure, 2026-08-28). */
  quote?: string
  /** 2-3 short stat callouts shown on founder cards only (owner restructure, 2026-08-28). */
  stats?: TeamStat[]
  /** Which team filter boxes show this member. */
  teams: TeamTag[]
  /** Founders render in the larger row above the roster, not in the grid. */
  founder: boolean
  /** Short card badges (phase 25, ported from the comp): teams ∪ city codes parsed from location. */
  badges: string[]
}

function normalizeImage(path: string | undefined): string | undefined {
  if (typeof path !== "string" || path.trim().length === 0) return undefined
  return path.startsWith("/") ? path : `/${path}`
}

function normalizeTeams(teams: unknown): TeamTag[] {
  if (!Array.isArray(teams)) return []
  return teams.filter((t): t is TeamTag => (TEAM_TAGS as readonly string[]).includes(t))
}

/** Union of filter teams + city codes parsed from the descriptive location string. */
function deriveBadges(teams: TeamTag[], location: string): string[] {
  const badges = new Set<string>(teams)
  if (location.includes("Los Angeles")) badges.add("LA")
  if (location.includes("San Francisco")) badges.add("SF")
  return TEAM_TAGS.filter((tag) => badges.has(tag))
}

type TeamRow = Omit<TeamMember, "image" | "teams" | "badges" | "founder"> & {
  image?: string
  teams?: unknown
  founder?: unknown
}

export const TEAM: TeamMember[] = (teamJson as TeamRow[]).map((m) => {
  const teams = normalizeTeams(m.teams)
  return {
    ...m,
    image: normalizeImage(m.image),
    teams,
    badges: deriveBadges(teams, m.location),
    founder: m.founder === true,
  }
})

export function getTeam(): TeamMember[] {
  return TEAM
}

/** Founders, for the larger row above the roster grid. */
export function getFounders(): TeamMember[] {
  return TEAM.filter((m) => m.founder)
}

/** Everyone else — the filterable roster grid. */
export function getRoster(): TeamMember[] {
  return TEAM.filter((m) => !m.founder)
}
