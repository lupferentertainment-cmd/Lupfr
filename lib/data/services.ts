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
  description: string
  features: string[]
}

export interface ServiceItem {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
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
      description: s.description,
      features: s.features,
    }
  })
}

export const SERVICES: ServiceItem[] = mapServices(servicesJson as ServiceItemRaw[])

export function getServices(): ServiceItem[] {
  return SERVICES
}
