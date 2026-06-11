/**
 * Open roles from data/careers.yml (build-time generated to generated/careers.json).
 * Each role links out to its LinkedIn posting — no application logic lives on the site.
 */
import careersJson from "@/lib/data/generated/careers.json"

export interface CareerItem {
  title: string
  location: string
  type: string
  workMode: string
  summary: string
  highlights: string[]
  linkedinUrl: string
}

export const CAREERS: CareerItem[] = careersJson as CareerItem[]

export function getCareers(): CareerItem[] {
  return CAREERS
}
