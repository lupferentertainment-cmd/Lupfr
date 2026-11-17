/**
 * Featured videos on /media's WATCH grid (LUPFR Website Design v16). Every
 * entry links out to the real video / post; posters are existing site photos.
 */
import { LINKS } from "@/lib/links"

export interface MediaVideo {
  title: string
  /** Mono kicker: "KIND · BRAND/PLACE". */
  meta: string
  poster: string
  href: string
}

export const MEDIA_VIDEOS: MediaVideo[] = [
  { title: "Bal Masque", meta: "EVENT FILM · IN//SIDE", poster: "/events/bal_masque_wings.webp", href: "https://youtu.be/Xt6zGwZ7jKg" },
  { title: "SOUND//CHECK · Artist Interview", meta: "PODCAST · SOUND//CHECK", poster: "/brands/soundcheck.webp", href: "https://youtube.com/shorts/1vm4F7b_Tgw" },
  { title: "SEA//SIDE 002 Recap", meta: "EVENT RECAP · SEA//SIDE", poster: "/events/seaside_002_recap.webp", href: "https://www.instagram.com/p/DdrQLrbpPqr/" },
  { title: "SEA//SIDE 001", meta: "EVENT FILM · LONG BEACH", poster: "/brands/seaside-gallery-2.webp", href: LINKS.youtube },
  { title: "HLWA · SEA//SIDE 000", meta: "LIVE SET · SF BAY", poster: "/brands/seaside-gallery-3.webp", href: LINKS.youtube },
  { title: "LUPFR b2b BAUM · Boiler Party", meta: "LIVE SET · SAN FRANCISCO", poster: "/events/boiler_room_marina.webp", href: LINKS.youtube },
]
