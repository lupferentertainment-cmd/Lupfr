/**
 * Corporate partners from data/partners.yml (build-time generated to generated/partners.json).
 */
import partnersJson from "@/lib/data/generated/partners.json"

export type PartnerLogoTreatment = "outline" | "solid" | "natural"

export interface PartnerItem {
  name: string
  /** External destination. Absent on label-only pending chips (no dead links). */
  url?: string
  /** Logo asset. Absent while a partner's logo is pending — chip renders the name as text. */
  image?: string
  /** Dark-mode variant. Resolved at runtime via useTheme; falls back to `image` if absent. */
  imageDark?: string
  ariaLabel?: string
  /** Mono silhouette + theme (default), outline/solid, or natural (no filter) — see globals.css `.partner-logo*`. */
  logoTreatment?: PartnerLogoTreatment
  /** Optional Tailwind classes for the partner logo image. */
  imageClassName?: string
}

function normalizeImage(path: string): string {
  return String(path).startsWith("/") ? path : `/${path}`
}

const PARTNER_LAYOUT =
  "block max-h-full max-w-full min-h-0 min-w-0 h-auto w-auto shrink-0 object-contain object-center"

const LOGO_TREATMENTS: Record<PartnerLogoTreatment, string> = {
  outline: "partner-logo partner-logo--outline",
  solid: "partner-logo partner-logo--solid",
  natural: "partner-logo partner-logo--natural",
}

function partnerLogoClasses(treatment: PartnerLogoTreatment | undefined): string {
  return treatment ? LOGO_TREATMENTS[treatment] : "partner-logo"
}

export const PARTNERS: PartnerItem[] = (partnersJson as PartnerItem[]).map((p) => ({
  ...p,
  image: p.image ? normalizeImage(p.image) : undefined,
  imageDark: p.imageDark ? normalizeImage(p.imageDark) : undefined,
  ariaLabel: p.ariaLabel ?? p.name,
  imageClassName: p.image
    ? [partnerLogoClasses(p.logoTreatment), PARTNER_LAYOUT, p.imageClassName]
        .filter(Boolean)
        .join(" ")
    : undefined,
}))

export function getPartners(): PartnerItem[] {
  return PARTNERS
}
