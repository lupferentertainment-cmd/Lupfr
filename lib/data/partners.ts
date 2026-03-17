/**
 * Corporate partners from data/partners.yml (build-time generated to generated/partners.json).
 */
import partnersJson from "@/lib/data/generated/partners.json"

export interface PartnerItem {
  name: string
  url: string
  image: string
  ariaLabel?: string
  /** Optional Tailwind classes for the partner logo image. */
  imageClassName?: string
}

function normalizeImage(path: string): string {
  return String(path).startsWith("/") ? path : `/${path}`
}

const DEFAULT_IMAGE_CLASS =
  "max-h-full max-w-full w-auto h-auto object-contain grayscale dark:opacity-95"

export const PARTNERS: PartnerItem[] = (partnersJson as PartnerItem[]).map((p) => ({
  ...p,
  image: normalizeImage(p.image),
  ariaLabel: p.ariaLabel ?? p.name,
  imageClassName: p.imageClassName ?? DEFAULT_IMAGE_CLASS,
}))

export function getPartners(): PartnerItem[] {
  return PARTNERS
}
