/**
 * LUPFR team from data/team.yml (build-time generated to generated/team.json).
 */
import teamJson from "@/lib/data/generated/team.json"

export const TEAM_TAGS = ["LA", "SF", "Exec"] as const

export type TeamTag = (typeof TEAM_TAGS)[number]

export interface TeamMember {
  name: string
  title: string
  location: string
  /** Omitted while a portrait is pending; cards render a placeholder. */
  image?: string
  bio: string
  /** Which team filter boxes show this member. */
  teams: TeamTag[]
}

function normalizeImage(path: string | undefined): string | undefined {
  if (typeof path !== "string" || path.trim().length === 0) return undefined
  return path.startsWith("/") ? path : `/${path}`
}

function normalizeTeams(teams: unknown): TeamTag[] {
  if (!Array.isArray(teams)) return []
  return teams.filter((t): t is TeamTag => (TEAM_TAGS as readonly string[]).includes(t))
}

type TeamRow = Omit<TeamMember, "image" | "teams"> & { image?: string; teams?: unknown }

export const TEAM: TeamMember[] = (teamJson as TeamRow[]).map((m) => ({
  ...m,
  image: normalizeImage(m.image),
  teams: normalizeTeams(m.teams),
}))

export function getTeam(): TeamMember[] {
  return TEAM
}
