/**
 * LUPFR team from data/team.yml (build-time generated to generated/team.json).
 */
import teamJson from "@/lib/data/generated/team.json"

export interface TeamMember {
  name: string
  title: string
  location: string
  image: string
  bio: string
}

function normalizeImage(path: string): string {
  return String(path).startsWith("/") ? path : `/${path}`
}

export const TEAM: TeamMember[] = (teamJson as TeamMember[]).map((m) => ({
  ...m,
  image: normalizeImage(m.image),
}))

export function getTeam(): TeamMember[] {
  return TEAM
}
