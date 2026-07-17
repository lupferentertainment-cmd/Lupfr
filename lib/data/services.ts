/**
 * Services data from data/services.yml (build-time generated to generated/services.json).
 * Maps icon name string to Lucide icon component.
 */
import {
  Music,
  Users,
  Mic2,
  PartyPopper,
  Building2,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import servicesJson from "@/lib/data/generated/services.json"
import { getBrands, type BrandItem } from "@/lib/data/brands"

const ICON_MAP: Record<string, LucideIcon> = {
  PartyPopper,
  Mic2,
  Building2,
  Users,
  Music,
  Sparkles,
}

export interface ServiceItemRaw {
  icon: string
  title: string
  image?: string
  description: string
  features: string[]
  relatedBrands?: string[]
}

export interface ServiceItem {
  icon: LucideIcon
  title: string
  image?: string
  description: string
  features: string[]
  relatedBrands: BrandItem[]
}

function resolveRelatedBrands(keys: string[] | undefined, title: string): BrandItem[] {
  if (!keys?.length) return []
  const brands = getBrands()
  return keys.map((key) => {
    const brand = brands.find((b) => b.key === key)
    if (!brand) {
      throw new Error(`Unknown related brand "${key}" on service "${title}". Valid: ${brands.map((b) => b.key).join(", ")}`)
    }
    return brand
  })
}

function mapServices(raw: ServiceItemRaw[]): ServiceItem[] {
  return raw.map((s) => {
    const Icon = ICON_MAP[s.icon]
    if (!Icon) {
      throw new Error(`Unknown service icon: ${s.icon}. Valid: ${Object.keys(ICON_MAP).join(", ")}`)
    }
    return {
      icon: Icon,
      title: s.title,
      image: s.image,
      description: s.description,
      features: s.features,
      relatedBrands: resolveRelatedBrands(s.relatedBrands, s.title),
    }
  })
}

export const SERVICES: ServiceItem[] = mapServices(servicesJson as ServiceItemRaw[])

export function getServices(): ServiceItem[] {
  return SERVICES
}

export function serviceSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

/** Dedicated per-service detail route (owner request 2026-07-17: every service is a clickable page). */
export function servicePath(service: Pick<ServiceItem, "title">): string {
  return `/services/${serviceSlug(service.title)}`
}

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return SERVICES.find((s) => serviceSlug(s.title) === slug)
}
