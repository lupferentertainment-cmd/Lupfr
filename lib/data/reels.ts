/**
 * Instagram reels (event recap videos) from data/reels.yml
 * (build-time generated to generated/reels.json).
 */
import reelsJson from "@/lib/data/generated/reels.json"

export interface ReelItem {
  label: string
  url: string
}

export const REELS: ReelItem[] = (reelsJson as ReelItem[]).map((reel) => ({
  label: String(reel.label),
  url: String(reel.url),
}))

export function getReels(): ReelItem[] {
  return REELS
}
