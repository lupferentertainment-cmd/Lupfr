"use client"

import { GoldShineText } from "@/components/gold-shine-text"
import Image from "next/image"
import { useEffect, useState } from "react"
import { isValidEmail, sanitizeEmail, sanitizeName } from "@/lib/contact-input"

/**
 * LUPFR Website Design v5 (owner, 2026-11-17) — "Start planning." Replaces the
 * old Contact wizard. A five-step intake (Occasion, Details, Experience,
 * Budget & timing, Contact) with a sticky step rail on the left and a panel
 * with a gold progress bar on the right, then a confirmation screen with a
 * summary. It posts to the existing `/api/contact` route (contract unchanged:
 * the occasion is `inquiryType`, the structured answers map onto the route's
 * optional fields, and the full brief goes into `message`). If the request
 * fails the visitor gets an inline error with a mailto fallback to
 * events@lupfr.com. The `presetInquiry` window event dispatched by
 * components/artists.tsx ("Submit Your Mix") pre-selects "Not sure yet" and
 * pre-fills the notes so that link keeps working.
 */

const PRESET_INQUIRY_EVENT = "presetInquiry"
export const EVENTS_EMAIL = "events@lupfr.com"
const STEP_NAMES = ["Occasion", "Details", "Experience", "Budget & timing", "Contact"] as const
const TOTAL_STEPS = STEP_NAMES.length
const DONE_STEP = TOTAL_STEPS + 1

const OCCASION_TILES: Array<[label: string, photo: string]> = [
  ["Private celebration", "/services/private-events-2026-ballroom.webp"],
  ["Corporate event", "/services/event-production-2026.webp"],
  ["Brand activation", "/services/brand-partnerships-2026.webp"],
  ["Yacht event", "/events/seaside_series_dj.webp"],
  ["Venue programming", "/brands/skiside-gateway-arrival.webp"],
  ["Not sure yet", "/events/bal_masque_acrobat.webp"],
]
const SETTINGS = ["On the water", "Outdoors", "Indoors", "Open to ideas"]
const GUESTS: Array<[string, string]> = [
  ["Under 50", "INTIMATE"],
  ["50–150", "GATHERING"],
  ["150–300", "BIG NIGHT"],
  ["300+", "FULL SCALE"],
]
const CITIES = ["Los Angeles", "San Francisco", "Orange County", "San Diego", "New York", "Miami", "Somewhere else"]
const TIMES = ["Daytime", "Sunset", "Evening", "Late night", "Not sure yet"]
const SERVICES = [
  "DJs & live music",
  "Sound & lighting",
  "Venue sourcing",
  "Food & bar",
  "Decor & theme",
  "Photo & video",
  "Branding & signage",
  "Transportation",
  "Hosts & staffing",
  "Full event management",
]
const BUDGETS: Array<[string, string]> = [
  ["Under $10K", "STARTING"],
  ["$10K–$25K", "ELEVATED"],
  ["$25K–$50K", "PREMIUM"],
  ["$50K–$100K", "SIGNATURE"],
  ["$100K+", "FLAGSHIP"],
  ["Not decided", "WE'LL ADVISE"],
]
const DECIDE = ["As soon as possible", "Within a month", "1–3 months", "Just exploring"]

const PIN =
  "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
const CAL = "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4"
const STAR = "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"

/** Option icons (24px viewBox, 1.4 stroke) — transcribed from the design's `ICN` map. */
const ICONS: Record<string, string> = {
  "On the water": "M2 10c2 1.6 4 1.6 6 0s4-1.6 6 0 4 1.6 6 0M2 16c2 1.6 4 1.6 6 0s4-1.6 6 0 4 1.6 6 0",
  Outdoors: "M12 3l6 9h-3l4 6H5l4-6H6zM12 18v3",
  Indoors: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M2 21h20",
  "Open to ideas": "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6",
  "Los Angeles": PIN,
  "San Francisco": PIN,
  "Orange County": PIN,
  "San Diego": PIN,
  "New York": PIN,
  Miami: PIN,
  "Somewhere else": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18",
  Daytime:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  Sunset: "M7 15a5 5 0 0 1 10 0M12 5v3M4.9 8.9l1.4 1.4M19.1 8.9l-1.4 1.4M2 15h2M20 15h2M3 19h18",
  Evening: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
  "Late night": `${STAR}M19 15l.8 1.7 1.7.8-1.7.8L19 20l-.8-1.7-1.7-.8 1.7-.8z`,
  "Not sure yet": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5",
  "DJs & live music": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  "Sound & lighting": "M8 3h8l-2 6h-4zM10 9l-5 12M14 9l5 12M4 21h16",
  "Venue sourcing": PIN,
  "Food & bar": "M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v8M8.5 21h7",
  "Decor & theme": STAR,
  "Photo & video": "M4 8h3l2-3h6l2 3h3v11H4zM12 10.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "Branding & signage": "M5 21V4M5 4h12l-2 4 2 4H5",
  Transportation: "M5 4h14v12H5zM5 11h14M5 16v3h14v-3M8 19v2M16 19v2",
  "Hosts & staffing": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7M18 14a6 6 0 0 1 4 6v1",
  "Full event management": "M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 12h6M9 16h4",
  "As soon as possible": "M13 2L4 14h7l-1 8 9-12h-7z",
  "Within a month": CAL,
  "1–3 months": CAL,
  "Just exploring": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z",
}

const LABEL = "mb-2.5 block font-mono text-[10px] tracking-[0.16em] text-[#a39b8d]"
const INPUT =
  "box-border w-full rounded-[3px] border border-white/12 bg-white/[0.035] px-[15px] py-3.5 font-sans text-[15px] text-[#f3efe6] outline-none [color-scheme:dark] placeholder:text-[#6f685c] focus:border-[#c9a869]/70"
const STEP_H3 = "m-0 font-condensed text-[clamp(30px,3vw,42px)] font-extrabold uppercase leading-[0.95] text-[#f3efe6] max-[640px]:text-[30px]"
const STEP_SUB = "m-0 text-[14.5px] leading-[1.5] text-[#bdb6a9]"

interface Brief {
  occasion: string | null
  settings: string[]
  guests: string | null
  city: string | null
  date: string
  flexible: boolean
  time: string | null
  venue: string
  services: string[]
  vision: string
  budget: string | null
  decide: string | null
  name: string
  email: string
  company: string
  phone: string
  notes: string
}

const EMPTY_BRIEF: Brief = {
  occasion: null,
  settings: [],
  guests: null,
  city: null,
  date: "",
  flexible: false,
  time: null,
  venue: "",
  services: [],
  vision: "",
  budget: null,
  decide: null,
  name: "",
  email: "",
  company: "",
  phone: "",
  notes: "",
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function dateText(b: Brief): string | null {
  if (b.date) return formatDate(b.date) + (b.flexible ? " (flexible)" : "")
  return b.flexible ? "Flexible" : null
}

/** The four confirmation-screen / rail values, built only from what the visitor entered. */
function railValues(b: Brief): Array<string | null> {
  const a = b.occasion ? b.occasion + (b.settings.length ? ` · ${b.settings.join(", ")}` : "") : null
  const d = [b.guests ? `${b.guests} guests` : null, b.city, dateText(b)].filter(Boolean).join(" · ") || null
  const s = b.services.length
    ? b.services.length > 2
      ? `${b.services.slice(0, 2).join(", ")} +${b.services.length - 2}`
      : b.services.join(", ")
    : b.vision.trim()
      ? "Vision noted"
      : null
  const bt = [b.budget, b.decide].filter(Boolean).join(" · ") || null
  const c = b.name.trim() ? b.name.trim() + (b.email.trim() ? ` · ${b.email.trim()}` : "") : null
  return [a, d, s, bt, c]
}

function stepComplete(b: Brief): boolean[] {
  return [
    !!b.occasion,
    !!(b.guests && b.city),
    !!(b.services.length || b.vision.trim()),
    !!b.budget,
    !!(b.name.trim() && isValidEmail(sanitizeEmail(b.email))),
  ]
}

/** The plain-text brief that goes into the `message` field (and the mailto fallback body). */
export function buildBriefText(b: Brief): string {
  return [
    `Occasion: ${b.occasion ?? "-"}`,
    `Setting: ${b.settings.join(", ") || "-"}`,
    `Guests: ${b.guests ?? "-"}`,
    `City / area: ${b.city ?? "-"}`,
    `Date: ${dateText(b) ?? "-"}`,
    `Time of day: ${b.time ?? "-"}`,
    `Venue: ${b.venue.trim() || "-"}`,
    `Services: ${b.services.join(", ") || "-"}`,
    `Vision: ${b.vision.trim() || "-"}`,
    `Budget: ${b.budget ?? "-"}`,
    `Decide by: ${b.decide ?? "-"}`,
    `Organization: ${b.company.trim() || "-"}`,
    `Phone / Instagram: ${b.phone.trim() || "-"}`,
    `Notes: ${b.notes.trim() || "-"}`,
  ].join("\n")
}

function mailtoHref(b: Brief): string {
  const subject = encodeURIComponent(`Event inquiry: ${b.occasion ?? "New event"}`)
  const body = encodeURIComponent(`${buildBriefText(b)}\n\nName: ${b.name.trim()}\nEmail: ${b.email.trim()}`)
  return `mailto:${EVENTS_EMAIL}?subject=${subject}&body=${body}`
}

function OptionIcon({ label, on }: { label: string; on: boolean }) {
  const d = ICONS[label]
  if (!d) return null
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={on ? "#e8caa0" : "#8f887c"}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="flex-none transition-[stroke] duration-200"
    >
      <path d={d} />
    </svg>
  )
}

function Chip({ label, on, onPick }: { label: string; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-[11px] text-left font-sans text-[14px] leading-none transition-all duration-200 max-[640px]:min-h-12 max-[640px]:rounded-[4px] max-[640px]:px-3 max-[640px]:py-3 max-[640px]:text-[13.5px] max-[640px]:leading-[1.2] ${
        on ? "border-[#c9a869] bg-[rgba(201,168,105,0.14)] text-[#fdf6e8]" : "border-white/12 bg-white/[0.02] text-[#d9d3c6]"
      }`}
    >
      <OptionIcon label={label} on={on} />
      <span className="min-w-0">{label}</span>
    </button>
  )
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 max-[640px]:grid max-[640px]:grid-cols-2">{children}</div>
}

function Tile({ label, sub, on, onPick }: { label: string; sub: string; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`flex min-w-0 flex-col gap-1.5 rounded-[3px] border px-4 pb-3.5 pt-4 text-left transition-all duration-200 max-[640px]:px-3 max-[640px]:pb-3 max-[640px]:pt-3.5 ${
        on ? "border-[#c9a869] bg-[rgba(201,168,105,0.12)]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <span className={`whitespace-nowrap font-condensed text-2xl font-extrabold uppercase leading-none max-[640px]:text-[21px] ${on ? "text-[#e8caa0]" : "text-[#f3efe6]"}`}>{label}</span>
      <span className="font-mono text-[9px] tracking-[0.14em] text-[#8f887c]">{sub}</span>
    </button>
  )
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function StartPlanning() {
  const [step, setStep] = useState(1)
  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function patch(next: Partial<Brief>) {
    setBrief((b) => ({ ...b, ...next }))
  }

  useEffect(() => {
    function onPreset(event: Event) {
      const detail = (event as CustomEvent<string>).detail
      setStep(1)
      setError(null)
      setBrief((b) => ({
        ...b,
        occasion: b.occasion ?? "Not sure yet",
        notes: typeof detail === "string" && detail ? (b.notes ? `${b.notes}\n` : "") + `Interested in: ${detail}` : b.notes,
      }))
    }
    window.addEventListener(PRESET_INQUIRY_EVENT, onPreset)
    return () => window.removeEventListener(PRESET_INQUIRY_EVENT, onPreset)
  }, [])

  const complete = stepComplete(brief)
  const values = railValues(brief)
  const canNext = step <= TOTAL_STEPS ? complete[step - 1] : false
  const reach = (n: number) => n <= step || complete.slice(0, n - 1).every(Boolean)
  const pct = Math.min(100, ((step - 1) / 5) * 100 + (step < DONE_STEP ? 4 : 0))

  async function send() {
    const name = sanitizeName(brief.name)
    const email = sanitizeEmail(brief.email)
    setSubmitting(true)
    setError(null)
    const payload = {
      inquiryType: brief.occasion ?? "New event",
      name,
      email,
      company: brief.company.trim() || undefined,
      budget: brief.budget ?? undefined,
      message: buildBriefText(brief),
      phone: brief.phone.trim() || undefined,
      services: brief.services.length ? brief.services : undefined,
      guestCount: brief.guests ?? undefined,
      eventDate: brief.date || undefined,
      flexibleDate: brief.flexible || undefined,
      city: brief.city ?? undefined,
      venue: brief.venue.trim() || undefined,
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setError("We couldn't send your brief just now.")
        return
      }
      setStep(DONE_STEP)
    } catch {
      setError("We couldn't send your brief just now.")
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    if (!canNext || submitting) return
    if (step === TOTAL_STEPS) void send()
    else setStep(step + 1)
  }

  function reset() {
    setBrief(EMPTY_BRIEF)
    setError(null)
    setStep(1)
  }

  const summary = [
    ["OCCASION", values[0]],
    ["DETAILS", values[1]],
    ["EXPERIENCE", values[2]],
    ["BUDGET & TIMING", values[3]],
  ].filter((row): row is [string, string] => !!row[1])

  return (
    <section id="contact" className="relative overflow-clip border-b border-white/10 bg-[#070605] px-5 py-[72px] text-[#f3efe6] sm:px-8 min-[641px]:py-[120px] min-[901px]:px-12" data-testid="start-planning">
      <div className="relative mx-auto grid max-w-[1240px] items-start gap-[56px] min-[1001px]:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] max-[1000px]:gap-7">
        <aside className="flex flex-col gap-8 min-[1001px]:sticky min-[1001px]:top-[110px] max-[1000px]:gap-0">
          <div>
            <div className="mb-[18px] flex gap-3.5 font-mono text-[11px] tracking-[0.22em] text-[#8f887c]">
              <span className="text-[#c9a869]">(04)</span>
              <span>INQUIRIES</span>
            </div>
            <h2 className="m-0 font-condensed text-[clamp(46px,5.4vw,80px)] font-extrabold uppercase leading-[0.88] max-[640px]:text-[44px]">
              <GoldShineText>Start planning.</GoldShineText>
            </h2>
            <p className="mt-[18px] max-w-[40ch] text-pretty text-[15.5px] leading-[1.6] text-[#d9d3c6] max-[640px]:mt-3 max-[640px]:text-[14.5px]">
              Tell us what you have in mind. Estimates and “not sure yet” are welcome. It takes about two minutes.
            </p>
          </div>
          <ol data-testid="planning-steps" className="m-0 flex list-none flex-col border-t border-white/10 p-0 max-[1000px]:hidden">
            {STEP_NAMES.map((label, i) => {
              const n = i + 1
              const on = n === step
              const done = !!values[i] && !on
              const can = step < DONE_STEP && reach(n)
              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled={!can}
                    aria-current={on ? "step" : undefined}
                    onClick={() => setStep(n)}
                    className={`grid w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2.5 border-0 border-b border-white/10 bg-transparent py-[15px] text-left ${can ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span className={`font-mono text-[10.5px] ${on || done ? "text-[#c9a869]" : "text-[#8f887c]"}`}>{`0${n}`}</span>
                    <span className="flex min-w-0 flex-col gap-[5px]">
                      <span className={`font-condensed text-[19px] font-extrabold uppercase leading-none transition-colors duration-300 ${on ? "text-[#fdf6e8]" : done ? "text-[#d9d3c6]" : "text-[#8f887c]"}`}>{label}</span>
                      <span className={`truncate text-[12.5px] leading-[1.3] ${values[i] ? "text-[#e8caa0]" : "text-[#8f887c]"}`}>{values[i] ?? (on ? "In progress" : "—")}</span>
                    </span>
                    <span
                      aria-hidden
                      className={`size-[7px] rotate-45 transition-colors duration-300 ${on ? "bg-[#c9a869]" : done ? "bg-[rgba(201,168,105,0.45)]" : "bg-white/10"}`}
                    />
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="flex flex-col gap-1.5 max-[1000px]:hidden">
            <span className="font-mono text-[10px] tracking-[0.16em] text-[#8f887c]">PREFER EMAIL?</span>
            <a href={`mailto:${EVENTS_EMAIL}`} className="text-[15px] text-[#c9a869] no-underline">
              {EVENTS_EMAIL}
            </a>
          </div>
        </aside>

        <div className="min-w-0 overflow-clip rounded-[6px] border border-white/[0.09] bg-[#0e0d0b] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="relative h-0.5 bg-white/[0.07]" role="progressbar" aria-label="Brief progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
            <span data-testid="planning-progress" className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#a67c3d] to-[#e8caa0] transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="box-border flex min-h-[540px] flex-col gap-[30px] px-10 pb-8 pt-9 max-[640px]:min-h-0 max-[640px]:gap-[22px] max-[640px]:px-[18px] max-[640px]:pb-5 max-[640px]:pt-6">
            {step < DONE_STEP ? (
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-[#8f887c]">
                <span>
                  STEP <span className="text-[#c9a869]">{`0${step}`}</span> / 05
                </span>
                <span>{STEP_NAMES[step - 1].toUpperCase()}</span>
              </div>
            ) : null}

            {step === 1 ? (
              <div key="s1" className="lp-pl-step flex flex-col gap-7 max-[640px]:gap-[22px]">
                <div className="flex flex-col gap-2">
                  <h3 className={STEP_H3}>What&apos;s the occasion?</h3>
                  <p className={STEP_SUB}>Pick the closest fit. We&apos;ll shape the rest together.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 max-[640px]:grid-cols-2" data-testid="occasion-tiles">
                  {OCCASION_TILES.map(([label, photo]) => {
                    const on = brief.occasion === label
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => patch({ occasion: on ? null : label })}
                        className={`relative aspect-[16/11] overflow-hidden rounded-[3px] border bg-[#0d0c0a] p-0 text-left transition-[border-color,box-shadow] duration-200 ${
                          on ? "border-[#c9a869] shadow-[0_0_0_1px_#c9a869,0_10px_30px_rgba(201,168,105,0.18)]" : "border-white/10"
                        }`}
                      >
                        <Image src={photo} alt="" fill sizes="(max-width: 640px) 45vw, 220px" className={`object-cover transition-opacity duration-300 ${on ? "opacity-95" : "opacity-50"}`} />
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,7,6,0.92)_10%,rgba(8,7,6,0.1)_75%)]" />
                        <span
                          aria-hidden
                          className={`absolute right-[9px] top-[9px] flex size-[18px] items-center justify-center rounded-full border text-[10px] text-[#1a1408] ${on ? "border-[#c9a869] bg-[#c9a869]" : "border-[rgba(243,239,230,0.5)] bg-[rgba(8,7,6,0.4)]"}`}
                        >
                          {on ? "✓" : ""}
                        </span>
                        <span className="absolute inset-x-3 bottom-2.5 font-condensed text-lg font-extrabold uppercase leading-none text-white">{label}</span>
                      </button>
                    )
                  })}
                </div>
                <div>
                  <span className={LABEL}>PREFERRED SETTING</span>
                  <ChipGroup>
                    {SETTINGS.map((s) => (
                      <Chip key={s} label={s} on={brief.settings.includes(s)} onPick={() => patch({ settings: toggle(brief.settings, s) })} />
                    ))}
                  </ChipGroup>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div key="s2" className="lp-pl-step flex flex-col gap-[26px] max-[640px]:gap-[22px]">
                <div className="flex flex-col gap-2">
                  <h3 className={STEP_H3}>The details</h3>
                  <p className={STEP_SUB}>A rough idea is plenty. A date window works too.</p>
                </div>
                <div>
                  <span className={LABEL}>EXPECTED GUESTS</span>
                  <div className="grid grid-cols-4 gap-2 max-[640px]:grid-cols-2">
                    {GUESTS.map(([label, sub]) => (
                      <Tile key={label} label={label} sub={sub} on={brief.guests === label} onPick={() => patch({ guests: brief.guests === label ? null : label })} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className={LABEL}>CITY OR AREA</span>
                  <ChipGroup>
                    {CITIES.map((c) => (
                      <Chip key={c} label={c} on={brief.city === c} onPick={() => patch({ city: brief.city === c ? null : c })} />
                    ))}
                  </ChipGroup>
                </div>
                <div className="grid grid-cols-2 items-end gap-3.5 max-[640px]:grid-cols-1">
                  <label className="block">
                    <span className={LABEL}>DATE</span>
                    <input type="date" value={brief.date} onChange={(e) => patch({ date: e.target.value })} className={INPUT} />
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={brief.flexible}
                    onClick={() => patch({ flexible: !brief.flexible })}
                    className="flex items-center gap-2.5 rounded-[3px] border border-white/12 bg-transparent px-[15px] py-[13px]"
                  >
                    <span className={`relative h-[18px] w-[30px] flex-none rounded-full transition-colors duration-200 ${brief.flexible ? "bg-[#c9a869]" : "bg-white/15"}`}>
                      <span className={`absolute top-0.5 size-3.5 rounded-full bg-[#f3efe6] transition-[left] duration-200 ${brief.flexible ? "left-3.5" : "left-0.5"}`} />
                    </span>
                    <span className="text-[14px] text-[#d9d3c6]">My dates are flexible</span>
                  </button>
                </div>
                <div>
                  <span className={LABEL}>TIME OF DAY</span>
                  <ChipGroup>
                    {TIMES.map((t) => (
                      <Chip key={t} label={t} on={brief.time === t} onPick={() => patch({ time: brief.time === t ? null : t })} />
                    ))}
                  </ChipGroup>
                </div>
                <label className="block">
                  <span className={LABEL}>VENUE (OPTIONAL)</span>
                  <input value={brief.venue} onChange={(e) => patch({ venue: e.target.value })} placeholder="Already booked? Tell us where. Otherwise, any ideas." className={INPUT} />
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <div key="s3" className="lp-pl-step flex flex-col gap-[26px] max-[640px]:gap-[22px]">
                <div className="flex flex-col gap-2">
                  <h3 className={STEP_H3}>The experience</h3>
                  <p className={STEP_SUB}>What should we handle? Select all that apply.</p>
                </div>
                <ChipGroup>
                  {SERVICES.map((s) => (
                    <Chip key={s} label={s} on={brief.services.includes(s)} onPick={() => patch({ services: toggle(brief.services, s) })} />
                  ))}
                </ChipGroup>
                <label className="block">
                  <span className={LABEL}>WHAT WOULD MAKE THIS A GREAT EVENT?</span>
                  <textarea
                    rows={4}
                    value={brief.vision}
                    onChange={(e) => patch({ vision: e.target.value })}
                    placeholder="The atmosphere, guest experience, must-haves, inspiration links..."
                    className={`${INPUT} resize-y leading-normal`}
                  />
                </label>
              </div>
            ) : null}

            {step === 4 ? (
              <div key="s4" className="lp-pl-step flex flex-col gap-[26px] max-[640px]:gap-[22px]">
                <div className="flex flex-col gap-2">
                  <h3 className={STEP_H3}>Budget &amp; timing</h3>
                  <p className={STEP_SUB}>An estimate or “not decided” is fine.</p>
                </div>
                <div>
                  <span className={LABEL}>TOTAL EVENT BUDGET</span>
                  <div className="grid grid-cols-3 gap-2 max-[640px]:grid-cols-2">
                    {BUDGETS.map(([label, sub]) => (
                      <Tile key={label} label={label} sub={sub} on={brief.budget === label} onPick={() => patch({ budget: brief.budget === label ? null : label })} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className={LABEL}>WHEN WOULD YOU LIKE TO DECIDE?</span>
                  <ChipGroup>
                    {DECIDE.map((d) => (
                      <Chip key={d} label={d} on={brief.decide === d} onPick={() => patch({ decide: brief.decide === d ? null : d })} />
                    ))}
                  </ChipGroup>
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div key="s5" className="lp-pl-step flex flex-col gap-6 max-[640px]:gap-[22px]">
                <div className="flex flex-col gap-2">
                  <h3 className={STEP_H3}>Who should we talk to?</h3>
                  <p className={STEP_SUB}>We&apos;ll reply within two business days.</p>
                </div>
                <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
                  <label className="block">
                    <span className={LABEL}>NAME</span>
                    <input value={brief.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Your name" autoComplete="name" className={INPUT} />
                  </label>
                  <label className="block">
                    <span className={LABEL}>EMAIL</span>
                    <input type="email" value={brief.email} onChange={(e) => patch({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" className={INPUT} />
                  </label>
                  <label className="block">
                    <span className={LABEL}>ORGANIZATION (OPTIONAL)</span>
                    <input value={brief.company} onChange={(e) => patch({ company: e.target.value })} placeholder="Company, venue or group" autoComplete="organization" className={INPUT} />
                  </label>
                  <label className="block">
                    <span className={LABEL}>PHONE OR INSTAGRAM (OPTIONAL)</span>
                    <input value={brief.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="(555) 555-5555 or @handle" className={INPUT} />
                  </label>
                </div>
                <label className="block">
                  <span className={LABEL}>ANYTHING ELSE? (OPTIONAL)</span>
                  <textarea
                    rows={3}
                    value={brief.notes}
                    onChange={(e) => patch({ notes: e.target.value })}
                    placeholder="Priorities, access needs, anything to avoid..."
                    className={`${INPUT} resize-y leading-normal`}
                  />
                </label>
                <p className="m-0 text-[12.5px] leading-normal text-[#8f887c]">This is an inquiry, not a booking. Dates, vendors and pricing are confirmed together.</p>
                {error ? (
                  <p role="alert" className="m-0 rounded-[3px] border border-[#e08a4a]/50 bg-[rgba(224,138,74,0.08)] px-3.5 py-3 text-[13.5px] leading-normal text-[#f3efe6]">
                    {error} Email your brief to{" "}
                    <a href={mailtoHref(brief)} className="text-[#e8caa0] underline">
                      {EVENTS_EMAIL}
                    </a>{" "}
                    instead.
                  </p>
                ) : null}
              </div>
            ) : null}

            {step === DONE_STEP ? (
              <div key="done" data-testid="planning-confirmation" className="lp-pl-step flex flex-1 flex-col items-start justify-center gap-5">
                <span aria-hidden className="flex size-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] text-[22px] text-[#1a1408]">
                  ✓
                </span>
                <h3 className="m-0 font-condensed text-[clamp(32px,3.4vw,48px)] font-extrabold uppercase leading-[0.95] text-[#f3efe6]">Your brief is on its way.</h3>
                <p className="m-0 max-w-[460px] text-base leading-[1.6] text-[#d9d3c6]">
                  Thanks, {brief.name.trim().split(/\s+/)[0] || "there"}. Someone from the LUPFR team will reply within two business days to talk through ideas and next steps.
                </p>
                <dl className="m-0 grid w-full grid-cols-2 border-t border-white/10 max-[640px]:grid-cols-1">
                  {summary.map(([k, v]) => (
                    <div key={k} className="flex min-w-0 flex-col gap-1.5 border-b border-white/10 py-3.5 pr-3">
                      <dt className="font-mono text-[9.5px] tracking-[0.16em] text-[#c9a869]">{k}</dt>
                      <dd className="m-0 text-[14px] text-[#f3efe6]">{v}</dd>
                    </div>
                  ))}
                </dl>
                <button type="button" onClick={reset} className="cursor-pointer border-0 border-b border-[#c9a869] bg-transparent p-0 pb-0.5 font-mono text-[10.5px] tracking-[0.14em] text-[#c9a869]">
                  START ANOTHER BRIEF
                </button>
              </div>
            ) : null}

            {step < DONE_STEP ? (
              <div
                data-testid="planning-nav"
                className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-[22px] max-[640px]:sticky max-[640px]:bottom-0 max-[640px]:z-10 max-[640px]:-mx-[18px] max-[640px]:-mb-5 max-[640px]:bg-[#0e0d0b] max-[640px]:px-[18px] max-[640px]:pb-4"
              >
                <button
                  type="button"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  className={`cursor-pointer border-0 bg-transparent py-2 font-mono text-[10.5px] tracking-[0.14em] text-[#bdb6a9] ${step > 1 ? "visible" : "invisible"}`}
                >
                  ← BACK
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={!canNext || submitting}
                  className={`inline-flex items-center gap-2.5 rounded-[2px] border px-[26px] py-4 font-mono text-[11.5px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                    canNext ? "cursor-pointer border-[rgba(243,227,196,0.7)] bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] text-[#1a1408]" : "cursor-not-allowed border-white/10 bg-transparent text-[#8f887c]"
                  }`}
                >
                  {step === TOTAL_STEPS ? (submitting ? "Sending…" : "Send My Brief") : "Continue"} <span aria-hidden>→</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
