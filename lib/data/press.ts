/**
 * Press/editorial data from data/press.yml (build-time generated to generated/press.json).
 */
import pressJson from "@/lib/data/generated/press.json"

export interface PressItem {
  id: number
  outlet: string
  category: string
  title: string
  excerpt: string
  image: string
  url: string
  dateISO: string
}

function normalizeImage(path: string): string {
  return String(path).startsWith("/") ? path : `/${path}`
}

export const PRESS: PressItem[] = (pressJson as PressItem[])
  .map((p) => ({ ...p, image: normalizeImage(p.image) }))
  .sort((a, b) => b.dateISO.localeCompare(a.dateISO))

export function getPress(): PressItem[] {
  return PRESS
}
