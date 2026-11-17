"use client"

import Image from "next/image"
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { GoldShineText } from "@/components/gold-shine-text"
import {
  CREW_EXEC,
  CREW_GROUPS,
  crewLinkLabel,
  getCrewEntries,
  splitCrewName,
  type CrewEntry,
  type CrewGroup,
  type CrewIconKey,
  type CrewMember,
} from "@/lib/data/crew"
import { cn } from "@/lib/utils"

/**
 * 2026-11-15, round 12 (owner design handoff "LUPFR Website Design v15"):
 * "Our Team" — the Exec Team (Will + Eliott) as two large tiles on top, then
 * five dashed group frames (v16: Operations 3, Business Dev 2 + Legal 1, Media 2 + photo fill, Advisors 3) (matching the dashed division frames in Our
 * Brands), each with a centered gold-icon header and a small sub-line. This
 * REPLACES the standalone Founders section (`claude-home-team.tsx`, removed).
 * Driven by `lib/data/crew.ts`; same fixed `#0b0a08`/`#c9a869` palette as its
 * sibling claude-home-* sections.
 *
 * Layout: 3-column desktop grid, each group spanning as many columns as it
 * has members (max 3) so every tile is the same width and `row dense`
 * packing leaves no empty cells (Operations 3, Biz Dev 3, Media 2 + Legal 1,
 * Advisors 3). ≤900px: one column, each group's tiles a horizontal
 * scroll-snap row, Exec tiles stack. The pop-up steps through all 13 people
 * and becomes a bottom sheet at ≤720px.
 *
 * Whole-tile click target is a real <button> stretched over the tile rather
 * than role="button" on the tile itself — the tile also holds <a> social
 * links, and interactive-inside-interactive is invalid; the links sit above
 * the overlay so clicking them never opens the pop-up.
 */

const GOLD = "#c9a869"

const ICON_PATHS: Record<CrewIconKey, ReactNode> = {
  ops: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx={15} cy={7} r={2} />
      <circle cx={9} cy={17} r={2} />
    </>
  ),
  biz: (
    <>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </>
  ),
  media: (
    <>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.5-2.5h7L17 7h2.5A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
      <circle cx={12} cy={13.5} r={3.5} />
    </>
  ),
  legal: (
    <>
      <path d="M12 4v16M8 20h8M5 7h14" />
      <path d="M5 7l-3 6a3 3 0 0 0 6 0z" />
      <path d="M19 7l-3 6a3 3 0 0 0 6 0z" />
    </>
  ),
  adv: (
    <>
      <circle cx={12} cy={12} r={9} />
      <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5" />
    </>
  ),
}

function GroupIcon({ icon, size }: { icon: CrewIconKey; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[icon]}
    </svg>
  )
}

function InstagramGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x={3} y={3} width={18} height={18} rx={5} />
      <circle cx={12} cy={12} r={4.2} />
      <circle cx={17.4} cy={6.6} r={0.6} fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Each button renders only when its URL exists (handoff: "Show each button only when its URL exists"). Callers skip the row entirely when a member has none. */
const BOX_CLASS = { 28: "size-7", 32: "size-8", 36: "size-9" } as const
const IG_SIZE = { 28: 15, 32: 16, 36: 18 } as const

function SocialLinks({ member, size, className }: { member: CrewMember; size: 28 | 32 | 36; className?: string }) {
  const box = BOX_CLASS[size]
  const base = cn(
    "flex shrink-0 items-center justify-center rounded-[4px] border border-[#c9a869]/50 font-sans font-bold text-[#c9a869] no-underline transition-colors hover:bg-[#c9a869]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a869]",
    box
  )
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {member.linkedin ? (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className={cn(base, "text-[13px]")}
        >
          in
        </a>
      ) : null}
      {member.instagram ? (
        <a
          href={member.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on Instagram`}
          className={base}
        >
          <InstagramGlyph size={IG_SIZE[size]} />
        </a>
      ) : null}
      {member.link ? (
        <a
          href={member.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} website`}
          className={cn(base, "text-[12px]")}
        >
          ↗
        </a>
      ) : null}
    </div>
  )
}

const SPAN_CLASS = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3" } as const
const COLS_CLASS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const

function CrewPhoto({
  member,
  sizes,
  className,
}: {
  member: CrewMember
  sizes: string
  className?: string
}) {
  const contain = member.fit === "contain"
  return (
    <Image
      src={member.photo}
      alt=""
      fill
      sizes={sizes}
      className={cn(contain ? "object-contain p-3" : "object-cover", className)}
      style={contain ? undefined : { objectPosition: member.focus ?? "50% 30%" }}
    />
  )
}

function CrewTile({ entry, onOpen }: { entry: CrewEntry; onOpen: (id: string, trigger: HTMLElement) => void }) {
  return (
    <div
      className={cn(
        "group relative box-border h-[232px] min-w-0 overflow-hidden rounded-[4px] border border-white/10 bg-[#141210] transition-colors",
        "hover:border-[#c9a869]/70 hover:bg-[#1a1712] focus-within:border-[#c9a869]/70",
        "max-[900px]:h-[204px] max-[900px]:w-[min(340px,calc(100%-48px))] max-[900px]:shrink-0 max-[900px]:snap-start"
      )}
      data-testid="crew-tile"
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-[38%] bg-[#0e0d0b]",
          "[-webkit-mask-image:linear-gradient(to_left,#000_35%,transparent_100%)] [mask-image:linear-gradient(to_left,#000_35%,transparent_100%)]"
        )}
      >
        <CrewPhoto member={entry} sizes="(max-width: 900px) 130px, 160px" />
      </div>

      <div className="pointer-events-none relative box-border flex h-full w-[62%] flex-col gap-1 py-4 pl-4 pr-3 max-[900px]:py-3">
        <div className="font-condensed text-[22px] font-bold uppercase leading-[0.95] text-[#f3efe6] max-[900px]:text-[18px]">{entry.name}</div>
        <div className="font-mono text-[9px] uppercase leading-[1.45] tracking-[0.12em] text-[#c9a869] max-[900px]:tracking-[0.06em]">{entry.role}</div>
        <p className="mt-1 line-clamp-4 shrink-0 text-pretty text-[12.5px] leading-[1.45] text-[#bdb6a9] max-[900px]:line-clamp-3 max-[400px]:line-clamp-2">
          {entry.short}
        </p>
        <div className="flex-1" />
        <div className="flex shrink-0 items-center gap-2 font-mono text-[9.5px] tracking-[0.16em] text-[#c9a869]">
          READ FULL BIO<span className="text-[13px] leading-none">→</span>
        </div>
        {entry.linkedin || entry.instagram || entry.link ? (
          <div className="mt-2.5 shrink-0 border-t border-white/10 pt-2.5 max-[900px]:mt-1.5 max-[900px]:pt-1.5">
            <SocialLinks member={entry} size={28} className="pointer-events-auto relative z-[2]" />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        aria-label={`Read full bio: ${entry.name}, ${entry.role}`}
        onClick={(e) => onOpen(entry.id, e.currentTarget)}
        className="absolute inset-0 z-[1] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#c9a869]"
      />
    </div>
  )
}

/** Centered gold-icon header + mono sub-line used by the Exec Team and every group frame. */
function FrameHeader({ group }: { group: Pick<CrewGroup, "label" | "sub" | "icon"> }) {
  return (
    <div className="mb-[18px] flex flex-col items-center text-center">
      <div className="flex items-center gap-2 text-[#c9a869]">
        <GroupIcon icon={group.icon} size={20} />
        <span className="font-condensed text-base font-extrabold uppercase tracking-[0.08em] text-[#f3efe6]">{group.label}</span>
      </div>
      <div className="mt-[3px] font-mono text-[9px] tracking-[0.14em] text-[#8f887c]">{group.sub}</div>
    </div>
  )
}

const FRAME_CLASS =
  "rounded-md border border-dashed border-white/15 bg-white/[0.015] px-4 pb-[18px] pt-5 max-[900px]:px-3 max-[900px]:pb-3.5 max-[900px]:pt-4"

function ExecTile({ entry, onOpen }: { entry: CrewEntry; onOpen: (id: string, trigger: HTMLElement) => void }) {
  const { first, last } = splitCrewName(entry.name)
  return (
    <div
      className={cn(
        "group relative box-border min-h-[340px] min-w-0 overflow-hidden rounded-[4px] border border-white/10 bg-[#141210] transition-colors",
        "hover:border-[#c9a869]/70 hover:bg-[#1a1712] focus-within:border-[#c9a869]/70",
        "max-[900px]:min-h-[300px] max-[480px]:min-h-[320px]"
      )}
      data-testid="crew-exec-tile"
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-[46%] bg-[#0e0d0b] max-[480px]:w-[44%]",
          "[-webkit-mask-image:linear-gradient(to_left,#000_40%,transparent_100%)] [mask-image:linear-gradient(to_left,#000_40%,transparent_100%)]"
        )}
      >
        <CrewPhoto member={entry} sizes="(max-width: 900px) 44vw, 360px" />
      </div>

      <div className="pointer-events-none relative box-border flex min-h-[340px] w-[60%] flex-col gap-2 py-[22px] pl-[26px] pr-4 pt-[26px] max-[900px]:min-h-[300px] max-[480px]:min-h-[320px] max-[480px]:w-[66%] max-[480px]:py-[18px] max-[480px]:pl-[18px] max-[480px]:pr-2.5 max-[480px]:pt-5">
        <div className="flex flex-wrap gap-x-[0.22em] font-condensed text-[clamp(32px,3.4vw,48px)] font-bold uppercase leading-[0.9] tracking-[-0.01em] max-[900px]:text-[38px] max-[480px]:text-[32px]">
          <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(201,168,105,0.7)" }}>
            {first}
          </span>
          <span style={{ color: GOLD }}>{last}</span>
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.14em] text-[#8f887c]">{entry.role}</div>
        <div className="my-1 h-0.5 w-12 bg-[#c9a869]" aria-hidden />
        <p className="m-0 line-clamp-3 shrink-0 text-pretty text-[14.5px] leading-[1.55] text-[#bdb6a9]">{entry.short}</p>
        <div className="flex-1" />
        <div className="flex shrink-0 items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-[#c9a869]">
          READ FULL BIO<span className="text-sm leading-none">→</span>
        </div>
        <div className="mt-2.5 shrink-0 border-t border-white/10 pt-3">
          <SocialLinks member={entry} size={32} className="pointer-events-auto relative z-[2]" />
        </div>
      </div>

      <button
        type="button"
        aria-label={`Read full bio: ${entry.name}, ${entry.role}`}
        onClick={(e) => onOpen(entry.id, e.currentTarget)}
        className="absolute inset-0 z-[1] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#c9a869]"
      />
    </div>
  )
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function CrewDialog({
  entries,
  index,
  onClose,
  onIndex,
}: {
  entries: CrewEntry[]
  index: number
  onClose: () => void
  onIndex: (next: number) => void
}) {
  const entry = entries[index]
  const titleId = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const bioRef = useRef<HTMLDivElement>(null)
  const [bioScrolls, setBioScrolls] = useState(false)
  const count = entries.length

  const go = useCallback((delta: number) => onIndex((index + delta + count) % count), [index, count, onIndex])

  useEffect(() => {
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  // The bottom fade only makes sense when the bio actually scrolls; on a short
  // bio it would otherwise fade the last line of text.
  useEffect(() => {
    const node = bioRef.current!
    node.scrollTop = 0
    setBioScrolls(node.scrollHeight > node.clientHeight + 1)
  }, [index])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation()
      onClose()
    } else if (e.key === "ArrowLeft") {
      go(-1)
    } else if (e.key === "ArrowRight") {
      go(1)
    } else if (e.key === "Tab") {
      // The × button is always present, so there's always at least one focusable node.
      const nodes = Array.from(cardRef.current!.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const { first, last } = splitCrewName(entry.name)
  const circle =
    "flex size-11 items-center justify-center rounded-full border border-[#c9a869]/50 bg-transparent text-base text-[#c9a869] transition-colors hover:bg-[#c9a869]/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a869]"

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#080706]/80 p-6 backdrop-blur-[6px] max-[720px]:items-end max-[720px]:p-0"
      onClick={onClose}
      onKeyDown={onKeyDown}
      data-testid="crew-modal"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative grid w-full max-w-[900px] grid-cols-[320px_minmax(0,1fr)] overflow-hidden rounded-md border border-[#c9a869]/45 bg-[#100e0b] text-[#f3efe6] shadow-[0_30px_80px_rgba(0,0,0,0.6)]",
          "max-h-[calc(100vh-48px)]",
          "max-[720px]:max-h-[92vh] max-[720px]:grid-cols-1 max-[720px]:overflow-y-auto max-[720px]:rounded-b-none max-[720px]:rounded-t-[14px]"
        )}
      >
        <div
          className={cn(
            "relative min-h-[440px] bg-[#0e0d0b]",
            "[-webkit-mask-image:linear-gradient(to_right,#000_55%,transparent_100%)] [mask-image:linear-gradient(to_right,#000_55%,transparent_100%)]",
            "max-[720px]:h-[240px] max-[720px]:min-h-0",
            "max-[720px]:[-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] max-[720px]:[mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)]"
          )}
        >
          <CrewPhoto member={entry} sizes="(max-width: 720px) 100vw, 320px" />
        </div>

        <div className="box-border flex min-h-0 min-w-0 flex-col gap-3.5 py-7 pl-5 pr-10 pt-9 max-[720px]:px-[22px] max-[720px]:pb-[22px] max-[720px]:pt-1">
          <div className="flex items-center gap-2 text-[#c9a869]">
            <GroupIcon icon={entry.icon} size={14} />
            <span className="font-mono text-[10px] tracking-[0.18em]">{entry.group}</span>
          </div>
          <h3
            id={titleId}
            className="flex flex-wrap gap-x-[0.22em] font-condensed text-[54px] font-bold uppercase leading-[0.9] tracking-[-0.01em] max-[720px]:text-[40px]"
          >
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(201,168,105,0.7)" }}>
              {first}
            </span>
            {/* Real space so the heading reads "Nikita Khandheria" to assistive tech;
                whitespace-only text nodes are ignored inside the flex container, so the
                visual gap still comes from `gap-x`. */}
            {" "}
            <span style={{ color: GOLD }}>{last}</span>
          </h3>
          <div className="font-mono text-[11px] uppercase leading-[1.5] tracking-[0.14em] text-[#8f887c]">{entry.role}</div>
          {entry.link || entry.linkedin || entry.instagram ? (
            <div className="flex items-center gap-2">
              {entry.link ? (
                <a
                  href={entry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#c9a869]/55 px-3.5 font-mono text-[10px] tracking-[0.16em] text-[#c9a869] no-underline transition-colors hover:bg-[#c9a869]/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a869]"
                >
                  {crewLinkLabel(entry)}
                  <span className="text-xs">↗</span>
                </a>
              ) : null}
              <SocialLinks member={{ ...entry, link: undefined }} size={36} />
            </div>
          ) : null}
          <div className="h-0.5 w-[60px] bg-[#c9a869]" aria-hidden />
          <div
            ref={bioRef}
            tabIndex={bioScrolls ? 0 : undefined}
            className={cn(
              "m-0 flex max-h-[260px] flex-col gap-3.5 overflow-y-auto overscroll-contain pr-4 text-base leading-[1.7] text-[#bdb6a9] [scrollbar-color:rgba(201,168,105,0.45)_transparent] [scrollbar-width:thin] max-[720px]:max-h-none",
              bioScrolls &&
                "[-webkit-mask-image:linear-gradient(to_bottom,#000_0,#000_calc(100%-40px),transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_0,#000_calc(100%-40px),transparent_100%)] max-[720px]:[-webkit-mask-image:none] max-[720px]:[mask-image:none]"
            )}
          >
            {entry.bio.split(/\n\s*\n/).map((paragraph) => (
              <p key={paragraph} className="m-0 text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 pt-3">
            <button type="button" aria-label="Previous team member" onClick={() => go(-1)} className={circle}>
              ←
            </button>
            <button type="button" aria-label="Next team member" onClick={() => go(1)} className={circle}>
              →
            </button>
            <span className="ml-1.5 font-mono text-[10px] tracking-[0.16em] text-[#8f887c]" data-testid="crew-position">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          </div>
        </div>

        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#0b0a08]/70 text-xl leading-none text-[#f3efe6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a869]"
        >
          ×
        </button>
      </div>
    </div>,
    document.body
  )
}

export function ClaudeHomeCrew() {
  const entries = useMemo(() => getCrewEntries(), [])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const open = useCallback(
    (id: string, trigger: HTMLElement) => {
      triggerRef.current = trigger
      setOpenIndex(entries.findIndex((e) => e.id === id))
    },
    [entries]
  )

  const close = useCallback(() => {
    setOpenIndex(null)
    // Return focus to the tile that opened the pop-up.
    triggerRef.current?.focus()
  }, [])

  // Running index across groups so each tile maps to its entry.
  let cursor = 0

  return (
    <section
      id="team"
      aria-label="Our Team"
      className="border-b border-white/10 bg-[#0b0a08] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">The People Behind It</p>
        <h2 className="mt-3 font-condensed text-[clamp(38px,4.2vw,64px)] font-extrabold uppercase leading-[0.9]">
          <GoldShineText>Our Team</GoldShineText>
        </h2>

        <div className="mt-12 flex flex-col gap-5">
          <div role="group" aria-label={CREW_EXEC.label} className={FRAME_CLASS} data-testid="crew-exec-frame">
            <FrameHeader group={CREW_EXEC} />
            <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-[minmax(0,1fr)]">
              {CREW_EXEC.members.map(() => {
                const entry = entries[cursor++]
                return <ExecTile key={entry.id} entry={entry} onOpen={open} />
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 [grid-auto-flow:row_dense] max-[900px]:grid-cols-[minmax(0,1fr)]">
            {CREW_GROUPS.map((group) => {
              const n = Math.min(group.members.length, 3) as 1 | 2 | 3
              return (
                <div
                  key={group.label}
                  role="group"
                  aria-label={group.label}
                  className={cn("min-w-0", FRAME_CLASS, SPAN_CLASS[n], "max-[900px]:col-span-full")}
                  data-testid="crew-group"
                >
                  <FrameHeader group={group} />
                  <div
                    className={cn(
                      "relative grid gap-4",
                      COLS_CLASS[n],
                      "max-[900px]:-mr-3 max-[900px]:flex max-[900px]:snap-x max-[900px]:snap-mandatory max-[900px]:gap-2.5 max-[900px]:overflow-x-auto max-[900px]:pr-3 max-[900px]:[scrollbar-width:none] max-[900px]:[&::-webkit-scrollbar]:hidden"
                    )}
                  >
                    {group.members.map(() => {
                      const entry = entries[cursor++]
                      return <CrewTile key={entry.id} entry={entry} onOpen={open} />
                    })}
                  </div>
                </div>
              )
            })}
            {/* v16: photo fill in the free grid cell beside the Media Team (after Legal packs under Business Development). Faded like the profile photos; hidden on mobile where groups swipe. */}
            <div
              aria-hidden="true"
              data-testid="crew-fill"
              className="relative mb-[19px] mt-[75px] box-border min-h-[232px] min-w-0 overflow-hidden rounded-[4px] border border-white/10 bg-[#141210] max-[900px]:hidden"
            >
              <div className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_left,#000_35%,transparent_100%)] [mask-image:linear-gradient(to_left,#000_35%,transparent_100%)]">
                <Image src="/hero/hero-slat-neon-dj.webp" alt="" fill sizes="(max-width: 1400px) 30vw, 440px" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {openIndex !== null && openIndex >= 0 ? (
        <CrewDialog entries={entries} index={openIndex} onClose={close} onIndex={setOpenIndex} />
      ) : null}
    </section>
  )
}
