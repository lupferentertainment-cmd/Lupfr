"use client"

import { GoldShineText } from "@/components/gold-shine-text"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { BrandSlashText } from "@/components/brand-slash-text"
import { BrandWordmark } from "@/components/brand-wordmark"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { ServiceIcon, type ServiceIconKey } from "@/components/lupfr-service-icons"
import { brandPath, getBrandBySlug, type BrandItem } from "@/lib/data/brands"
import { eventDetailPath, getEventBySlug } from "@/lib/events"
import { isFreshWheel, snapTarget, stackPositions } from "@/lib/stack-snap"
import { CONTACT_PAGE_PATH } from "@/lib/site"

/**
 * Oct 1 2026 homepage redesign (owner table, confirmed via follow-up: "Curated
 * showcase, matching the design"). This replaces the earlier build of this
 * section, which repurposed the live events calendar — matching this
 * section's real counterpart in the design file, `id="work"` / "OUR WORK" /
 * "Featured Experiences" in LUPFR Website v3.dc.html (claude-redesign-
 * reference.html), a hand-picked reel of 3 flagship case studies, not an
 * auto-updating feed. Facts (title/date/location) are pulled live from
 * data/events.yml via getEventBySlug so they can't drift from the real
 * listing; the narrative copy and "delivered" tags are transcribed from
 * Will's own design file. Media (video+photo) comes from "LUPFR Website
 * Design NEW/assets" on Will's desktop, re-encoded per his own
 * Website Fix Notes.md spec (muted, 8-12s loops, 1.5-3MB) — see
 * components/lazy-loop-video.tsx.
 *
 * The live calendar view (upcoming/past events) that used to live here is
 * unchanged elsewhere on the site — /events still lists every real event.
 */

/**
 * These 3 slugs are hand-picked and hardcoded on purpose (see the file
 * doc-comment above) — if one is ever renamed/removed in data/events.yml,
 * this throws loudly at import time instead of silently substituting
 * placeholder copy for a flagship case study.
 */
function requireEvent(slug: string) {
  const event = getEventBySlug(slug)
  if (!event) throw new Error(`claude-home-experiences: expected event "${slug}" to exist in data/events.yml`)
  return event
}

function monthYear(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()
}

// 2026-10-02 fix (owner report: "SEA//SIDE is not the // blue, bal masque
// is not the same size and does not have the videos"). `seaside.accent`
// (#6fb8c9, data/brands.yml) is the real verified brand blue — BrandSlashText
// was being called with no `color` at all for this title, so its "//" fell
// back to the shared gold default instead. Bal Masque already has a real,
// already-encoded loop video on disk (`public/events/bal_masque_loop.{mp4,webm}`,
// re-encoded from the design canvas's own `assets/events/bal-masque-loop.mp4`)
// that this section simply never wired up — SEA//SIDE was the only case study
// with a `video` set, so its media block was the only one playing a loop
// instead of a static frame, which reads as a different (smaller/quieter) card.
const seasideAccent = getBrandBySlug("seaside")?.accent

// 2026-11-17 (design v5): the per-card brand eyebrow (IN//SIDE, OUT//SIDE)
// from earlier rounds is gone — the v5 "Stack" cards carry only the index,
// meta line, title, description, service chips and the two CTAs.

// 2026-10-02 fix, round 2 (owner screenshots of the Claude design file:
// "it should align everything to that"). Each case study's "Services
// Delivered" list (icon-badge + bold category label + one-line detail) is
// transcribed verbatim from the design file's own `feat` + `SVC` data
// tables in LUPFR Website v3.dc.html — not the earlier screenshot-read
// pass, which had gotten Bal Masque's 2nd item wrong (guessed "Event
// Management"; the design file's own data says `brand` → "Brand
// Activations", same label/icon as the home Services category) and in the
// wrong order. Icons are the design's own SVG path keys
// (components/lupfr-service-icons.tsx) via the `SVC` table's icon-per-
// category mapping: private→hospitality, brand→spark, music→music,
// mgmt→production, content→camera.
const DELIVERED_LABELS: Record<string, ServiceIconKey> = {
  "PRIVATE EVENTS": "hospitality",
  "BRAND ACTIVATIONS": "spark",
  "MUSIC & ENTERTAINMENT": "music",
  PRODUCTION: "production",
  "CONTENT & MEDIA": "camera",
}

function delivered(items: Array<[label: keyof typeof DELIVERED_LABELS, description: string]>): DeliveredItem[] {
  return items.map(([label, description]) => ({ icon: DELIVERED_LABELS[label], label, description }))
}

const balMasque = requireEvent("bal-masque")
const goldenGateLive = requireEvent("zusebi-002-live-from-golden-gate")
const seasideLongBeach = requireEvent("seaside-001-long-beach-harbor")
const seasideMarinaDelRey = requireEvent("seaside-002")

function requireBrand(slug: string): BrandItem {
  const brand = getBrandBySlug(slug)
  if (!brand) throw new Error(`claude-home-experiences: expected brand "${slug}" to exist in data/brands.yml`)
  return brand
}

const skiside = requireBrand("skiside")

interface DeliveredItem {
  icon: ServiceIconKey
  label: string
  description: string
}

/**
 * Round 17 (owner, 2026-11-20): a not-yet-delivered brand gets a "teaser" card instead of a case study: the
 * photo stays clear and one slim bar holds the wordmark, the Coming pill and a single button. It has no
 * description, service chips, thumbnails or film (nothing has been delivered yet).
 */
interface TeaserCard {
  brand: BrandItem
  meta: string
  pill: string
  cta: string
  href: string
  photo: { src: string; alt: string }
}

interface CaseStudy {
  title: React.ReactNode
  meta: string
  mediaLabel: string
  desc: string
  delivered: DeliveredItem[]
  href: string
  linkLabel: string
  /** Real, already-verified external "watch the full film" link (design
   * file's conditional `fx.hasFilm` "Watch Full Film" button) — only set
   * where a genuine recap video already exists elsewhere in the site's own
   * data (never a fabricated link). Omitted entirely means the design's
   * `hasFilm` is false for that case study; no button renders. */
  filmUrl?: string
  video?: { mp4: string; webm: string }
  main: { src: string; alt: string }
  side1: { src: string; alt: string }
  /**
   * `position` is an optional CSS object-position override (default center).
   * SEA//SIDE's side2 uses it — see that photo's own comment below.
   */
  side2: { src: string; alt: string; position?: string }
}

const caseStudies: Array<CaseStudy | TeaserCard> = [
  {
    title: <BrandSlashText text="SEA//SIDE Series" color={seasideAccent} />,
    meta: `${seasideLongBeach.location.split(",")[0].toUpperCase()} · ${seasideMarinaDelRey.location.split(",")[0].toUpperCase()}`,
    mediaLabel: "EVENT FILM",
    desc: "Public and private yacht events built around music and hospitality. From sold-out public sailings to private charters, company outings and brand activations on the water, we handle the yacht, talent, boarding, production and content.",
    delivered: delivered([
      ["PRIVATE EVENTS", "Public & private sailings"],
      ["PRODUCTION", "Yacht sourcing, sound, lighting"],
      ["MUSIC & ENTERTAINMENT", "Artist Bookings"],
      ["CONTENT & MEDIA", "Photo & film"],
    ]),
    href: brandPath({ key: "seaside" }),
    linkLabel: "View SEA//SIDE →",
    // Same "SEA//SIDE 002" Instagram recap already used (and verified real)
    // as claude-home-media.tsx's side-clip link — that event is literally
    // one of this case study's own two referenced events (seaside-002).
    filmUrl: "https://www.instagram.com/p/DdrQLrbpPqr/",
    video: { mp4: "/events/seaside_series.mp4", webm: "/events/seaside_series.webm" },
    main: { src: "/events/seaside_series_dj.webp", alt: "DJ set aboard a SEA//SIDE Series sailing" },
    side1: { src: "/events/seaside_series_interview.webp", alt: "SEA//SIDE Series guest interview on the water" },
    // 2026-10-02 fix (owner: "this should be the bottom right photo for
    // SEA//SIDE Series (get their full heads in)" — a new on-deck interview
    // photo). This side2 slot is a near-square crop, but the source photo is
    // portrait (1117x1408), so object-cover's default center position would
    // clip the tallest guest's hair at the very top (verified by rendering
    // the actual crop math before/after). Anchoring to the top keeps all
    // three full heads in frame with clean headroom.
    side2: {
      src: "/events/seaside_series_group_interview.webp",
      alt: "Guests interviewed on deck during a SEA//SIDE Series sailing",
      position: "center top",
    },
  },
  {
    title: balMasque.title,
    meta: `SAN FRANCISCO · ${monthYear(balMasque.dateISO!)}`,
    mediaLabel: "PHOTOGRAPHY",
    desc: "Masquerade evenings with Maison Noir, where dress code, design and music set a new standard for events",
    delivered: delivered([
      ["BRAND ACTIVATIONS", "Creative direction"],
      ["PRODUCTION", "Full Production Suite"],
      ["MUSIC & ENTERTAINMENT", "Performers & DJs"],
      ["CONTENT & MEDIA", "Photography"],
    ]),
    href: eventDetailPath("bal-masque"),
    linkLabel: "View experience →",
    // Same Bal Masque YouTube recap already used (and verified real) as
    // claude-home-media.tsx's side-clip link.
    filmUrl: "https://www.youtube.com/watch?v=Xt6zGwZ7jKg",
    video: { mp4: "/events/bal_masque_loop.mp4", webm: "/events/bal_masque_loop.webm" },
    main: { src: "/events/bal_masque_wings.webp", alt: "Bal Masque — feathered wings installation" },
    side1: { src: "/events/bal_masque_acrobat.webp", alt: "Bal Masque — aerial acrobat performance" },
    side2: { src: "/events/bal_masque_masque_detail.webp", alt: "Bal Masque — masquerade detail" },
  },
  {
    title: goldenGateLive.title,
    meta: `GOLDEN GATE PARK, SAN FRANCISCO · ${monthYear(goldenGateLive.dateISO!)}`,
    mediaLabel: "FULL SET",
    desc: "An open-air sunset pop up in Golden Gate Park. Zusebi played live to the city, with the setting doing the rest.",
    delivered: delivered([
      ["PRODUCTION", "Set up, lighting & crowd"],
      ["MUSIC & ENTERTAINMENT", "Artist & sound"],
      ["CONTENT & MEDIA", "Full media kit"],
    ]),
    href: eventDetailPath("zusebi-002-live-from-golden-gate"),
    linkLabel: "View experience →",
    // 2026-10-03 fix (owner: "I have attached the new Golden Gate Live
    // video. Add this as both the GOLDEN GATE hero video and also in the
    // main box of the experience section for it too") — re-encoded from the
    // owner's own attached clip (public/events/ggl_main_video.{mp4,webm}),
    // same pipeline as Bal Masque/SEA//SIDE's loop videos. This case study
    // previously had no real video asset of its own and fell back to a
    // static main photo — see claude-home-hero.tsx's own matching note.
    video: { mp4: "/events/ggl_main_video.mp4", webm: "/events/ggl_main_video.webm" },
    main: { src: "/events/ggl_main_dj.webp", alt: "Zusebi 002: Golden Gate Live — DJ set in Golden Gate Park" },
    side1: { src: "/events/ggl_dj_crowd.webp", alt: "Zusebi 002: Golden Gate Live — crowd" },
    side2: { src: "/events/ggl_shoulders.webp", alt: "Zusebi 002: Golden Gate Live — sunset over the city" },
  },
  {
    brand: skiside,
    meta: "LAKE TAHOE",
    pill: skiside.tag,
    cta: skiside.landing?.cta ?? "Partner with SKI//SIDE",
    href: CONTACT_PAGE_PATH,
    photo: { src: "/brands/skiside-summit-set.webp", alt: "SKI//SIDE summit set: a DJ on a mountain stage between the red and blue slash sculpture" },
  },
]

function cardCounter(index: number, total: number): string {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
}

function thumbs(study: CaseStudy): Array<{ src: string; alt: string; position?: string }> {
  return [study.side1, study.side2]
}

const CARD_SHELL =
  "sticky mb-6 h-[min(80vh,760px)] min-h-[540px] overflow-hidden rounded-[4px] border border-white/10 bg-[#0d0c0a] last:mb-0 max-[900px]:h-[74vh] max-[900px]:max-h-[640px] max-[900px]:min-h-0"
const GOLD_BTN =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[2px] border border-[rgba(243,227,196,0.7)] bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] px-[18px] py-[13px] font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1a1408] max-[900px]:px-3.5 max-[900px]:py-[11px] max-[900px]:text-[9.5px]"
const GHOST_BTN =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[2px] border border-[#c9a869]/55 bg-[rgba(8,7,6,0.35)] px-[18px] py-[13px] font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#e8caa0] max-[900px]:px-3.5 max-[900px]:py-[11px] max-[900px]:text-[9.5px]"

/**
 * One sticky "Stack" card (design v5, fx1). Each card pins at `92px + index x
 * 16px` so the next one slides over it, leaving a sliver of the previous
 * title visible. Owner override (2026-11-17): the Zusebi card keeps the
 * CURRENT Golden Gate loop video — no YouTube background or embed.
 */
function CaseStudyCard({ study, index, total, covered, cardRef }: { study: CaseStudy; index: number; total: number; covered: boolean; cardRef: (el: HTMLElement | null) => void }) {
  const counter = cardCounter(index, total)
  return (
    <article
      ref={cardRef}
      data-testid="experience-card"
      className={CARD_SHELL}
      style={{ top: 92 + index * 16 }}
    >
      {study.video ? (
        <div className="absolute inset-0">
          <LazyLoopVideo srcMp4={study.video.mp4} srcWebm={study.video.webm} poster={study.main.src} suspended={covered} className="h-full w-full object-cover" />
        </div>
      ) : (
        <Image src={study.main.src} alt={study.main.alt} fill sizes="100vw" className="object-cover" />
      )}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,5,0.88)_0%,rgba(7,6,5,0.45)_48%,rgba(7,6,5,0)_80%)] max-[900px]:hidden" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,5,0.35)_0%,rgba(7,6,5,0)_30%,rgba(7,6,5,0.2)_60%,rgba(7,6,5,0.92)_100%)] max-[900px]:bg-[linear-gradient(180deg,rgba(7,6,5,0)_35%,rgba(7,6,5,0.95)_100%)]" />

      <div className="absolute inset-x-8 top-7 flex items-start justify-between gap-6 max-[900px]:inset-x-5 max-[900px]:top-5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-[#e8caa0]">{counter}</span>
        <span className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[#e6e0d4] max-[900px]:hidden">{study.meta}</span>
      </div>

      <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-8 max-[900px]:inset-x-5 max-[900px]:bottom-5">
        <div className="flex min-w-0 max-w-[640px] flex-col gap-4 max-[900px]:gap-3.5">
          <h3 className="m-0 font-condensed text-[clamp(40px,5.4vw,84px)] font-extrabold uppercase leading-[0.9] text-[#fdf6e8] max-[900px]:text-[40px]">{study.title}</h3>
          <p className="m-0 max-w-[520px] text-[clamp(14px,1.2vw,17px)] leading-[1.55] text-[#e6e0d4] max-[900px]:hidden">{study.desc}</p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0 max-[900px]:hidden">
            {study.delivered.map((item) => (
              <li key={item.label}>
                <a
                  href="#services"
                  title={item.description}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c9a869]/45 bg-[rgba(8,7,6,0.45)] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#e8caa0]"
                >
                  <ServiceIcon icon={item.icon} size={12} />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {study.filmUrl ? (
              <a href={study.filmUrl} target="_blank" rel="noopener noreferrer" className={GOLD_BTN}>
                <span className="h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-[#1a1408]" aria-hidden />
                Watch Film
              </a>
            ) : null}
            <Link href={CONTACT_PAGE_PATH} className={GHOST_BTN}>
              Create One Like This <span aria-hidden>→</span>
            </Link>
            <Link href={study.href} className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0] max-[900px]:hidden">{study.linkLabel}</Link>
          </div>
        </div>

        <div className="flex flex-none gap-2.5 max-[1100px]:hidden" data-testid="experience-thumbs">
          {thumbs(study).map((thumb) => (
            <div key={thumb.src} className="relative aspect-[4/5] w-[150px] overflow-hidden rounded-[2px] border border-white/20 bg-[#0d0c0a]">
              <Image
                src={thumb.src}
                alt={thumb.alt}
                fill
                sizes="150px"
                className="object-cover"
                style={thumb.position ? { objectPosition: thumb.position } : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}


/** The "Coming" teaser card (owner pick F, 2026-11-20): clear photo, counter and place on top, one slim bottom bar. */
function TeaserCardView({ card, index, total, cardRef }: { card: TeaserCard; index: number; total: number; cardRef: (el: HTMLElement | null) => void }) {
  return (
    <article ref={cardRef} data-testid="experience-card" data-teaser className={CARD_SHELL} style={{ top: 92 + index * 16 }}>
      <Image src={card.photo.src} alt={card.photo.alt} fill sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-[110px] bg-[linear-gradient(180deg,rgba(7,6,5,0.75),rgba(7,6,5,0))]" />
      <div className="absolute inset-x-8 top-7 flex items-start justify-between gap-6 max-[900px]:inset-x-5 max-[900px]:top-5 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
        <span className="font-mono text-[11px] tracking-[0.2em] text-[#e8caa0]">{cardCounter(index, total)}</span>
        <span className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-[#e6e0d4]">{card.meta}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 bg-[linear-gradient(180deg,rgba(7,6,5,0),rgba(7,6,5,0.92)_40%)] px-8 pb-5 pt-10 max-[900px]:px-5 max-[900px]:pb-4">
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
          <h3 className="m-0 font-condensed text-[clamp(32px,3.8vw,52px)] font-extrabold uppercase leading-[0.9] text-[#fdf6e8] max-[900px]:text-[34px]">
            <BrandWordmark brand={card.brand} />
          </h3>
          <span className="rounded-full border border-[#5b8ee6] bg-[rgba(91,142,230,0.16)] px-[11px] py-[5px] font-mono text-[10px] uppercase tracking-[0.16em] text-[#cfe0ff]">{card.pill}</span>
        </div>
        <Link href={card.href} className={GOLD_BTN}>
          {card.cta}
        </Link>
      </div>
    </article>
  )
}

// A card is "covered" once the next card has slid over it (next.top - this.top <= the 16px stack step).
const COVER_THRESHOLD_PX = 20

/** Tracks which stack cards are hidden behind the next one, so their videos can pause. One passive,
 * rAF-throttled scroll listener for the whole stack. */
function useCoveredCards(count: number) {
  const els = useRef<HTMLElement[]>([])
  const [covered, setCovered] = useState<boolean[]>(() => Array.from({ length: count }, () => false))
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const tops = els.current.map((el) => el.getBoundingClientRect().top)
      const next = tops.map((top, i) => i + 1 < tops.length && tops[i + 1]! - top <= COVER_THRESHOLD_PX)
      setCovered((prev) => (prev.every((v, i) => v === next[i]) ? prev : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [count])
  // Refs are kept dense (a card that unmounts is simply not re-registered).
  return { covered, els, setEl: (i: number) => (el: HTMLElement | null) => { if (el) els.current[i] = el } }
}

const SNAP_LOCK_MS = 650
const SNAP_ENTRY_VH = 0.6
const SWIPE_MIN_PX = 24
const TAIL_MS = 1500

function isBlockedTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[role="dialog"],[aria-modal="true"],input,textarea,select') !== null
}

/**
 * Card-by-card snapping (owner, Round 16: "when I scroll even a bit, it just takes me to the next one").
 * A wheel tick, arrow/page key or swipe inside the stack's zone jumps straight to the neighbouring card
 * instead of scrolling a few pixels, so the page never rests between two cards. Outside the zone (above the
 * first card, past the last) everything scrolls normally, so the stack can never trap the page.
 */
function useStackSnap(containerRef: { current: HTMLElement | null }, cards: { current: HTMLElement[] }) {
  useEffect(() => {
    let lockUntil = 0
    let snapAt = 0
    let snapDir = 0
    let lastWheelAt = 0
    let lastAbs = 0
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
    const target = (dir: 1 | -1): number | null => {
      const container = containerRef.current
      const els = cards.current
      const first = els[0]
      if (!container || !first || els.length === 0) return null
      const gap = Number.parseFloat(getComputedStyle(first).marginBottom) || 0
      const stickyTops = els.map((el) => Number.parseFloat(el.style.top) || 0)
      const docTop = container.getBoundingClientRect().top + window.scrollY
      const positions = stackPositions(docTop, first.offsetHeight + gap, stickyTops)
      return snapTarget(window.scrollY, dir, positions, window.innerHeight * SNAP_ENTRY_VH)
    }
    const go = (top: number, dir: number) => {
      snapAt = performance.now()
      snapDir = dir
      lockUntil = snapAt + SNAP_LOCK_MS
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || e.deltaY === 0 || isBlockedTarget(e.target)) return
      const now = performance.now()
      const abs = Math.abs(e.deltaY)
      const fresh = isFreshWheel(lastAbs, abs, now - lastWheelAt)
      lastWheelAt = now
      lastAbs = abs
      const dir = e.deltaY > 0 ? 1 : -1
      // Mid-snap, and for the inertia tail of the flick that triggered it, swallow ticks in the same direction.
      if (dir === snapDir && (now < lockUntil || (!fresh && now - snapAt < TAIL_MS))) {
        e.preventDefault()
        return
      }
      const to = target(dir)
      if (to === null) return
      e.preventDefault()
      go(to, dir)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target !== document.body && e.target !== document.documentElement)) return
      const down = e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)
      const up = e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)
      if (!down && !up) return
      const to = target(down ? 1 : -1)
      if (to === null) return
      e.preventDefault()
      if (performance.now() >= lockUntil) go(to, down ? 1 : -1)
    }
    let startY = 0
    let engaged: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0
      engaged = null
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? startY
      if (engaged === null && Math.abs(startY - y) > 6 && !isBlockedTarget(e.target)) {
        engaged = target(startY - y > 0 ? 1 : -1) ?? -1
      }
      if (engaged !== null && engaged >= 0 && e.cancelable) e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - (e.changedTouches[0]?.clientY ?? startY)
      if (engaged !== null && engaged >= 0 && Math.abs(dy) >= SWIPE_MIN_PX) go(engaged, dy > 0 ? 1 : -1)
      engaged = null
    }
    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", onKey)
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [containerRef, cards])
}

export function ClaudeHomeExperiences() {
  const { covered, setEl, els } = useCoveredCards(caseStudies.length)
  const stackRef = useRef<HTMLDivElement | null>(null)
  useStackSnap(stackRef, els)
  return (
    <section id="events" className="border-b border-white/10 bg-[#0b0a08] px-5 py-[72px] text-[#f3efe6] sm:px-8 min-[901px]:px-12 min-[901px]:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex gap-3.5 font-mono text-[11px] tracking-[0.22em] text-[#8f887c]">
              <span className="text-[#c9a869]">(02)</span>
              <span>OUR WORK</span>
            </div>
            <h2 className="m-0 font-condensed text-[clamp(42px,4.8vw,72px)] font-extrabold uppercase leading-[0.88]"><GoldShineText>Featured Experiences</GoldShineText></h2>
            <p className="mb-0 mt-4 max-w-[560px] text-[15px] leading-[1.55] text-[#bdb6a9]">
              Signature LUPFR productions — floating concerts, brand activations, and live-music events we&rsquo;ve built from the ground up.
            </p>
          </div>
          <Link href="/events" className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#e8caa0]">View Past Events →</Link>
        </div>
        <div ref={stackRef}>
          {caseStudies.map((study, i) =>
            "brand" in study ? (
              <TeaserCardView key={i} card={study} index={i} total={caseStudies.length} cardRef={setEl(i)} />
            ) : (
              <CaseStudyCard key={i} study={study} index={i} total={caseStudies.length} covered={covered[i] === true} cardRef={setEl(i)} />
            )
          )}
        </div>
      </div>
    </section>
  )
}
