"use client"

import { BrandSlashText } from "@/components/brand-slash-text"
import { PLATFORM_PROGRAMS, type BrandItem, type PlatformProgram } from "@/lib/data/brands"

/**
 * Corporate-structure tree (owner restructure note, 2026-08-28: "Design the
 * corporate tree page exactly as in Claude file," with reference
 * screenshots) — LUPFR at the top, three columns below.
 *
 * Restructured to three columns with the platform programs folded in (owner
 * correction, 2026-09-02, with a new reference screenshot: "Under Explore
 * LUPFR (sub brand page), we need to have the platform categories included
 * now... we have split up things into Live Events, Media, Corporate"). Each
 * column groups one or more operating brands (tappable, unchanged — jump to
 * `#brand-<key>` further down this page) with the platform programs that
 * support that side of the business (not tappable — platform programs don't
 * have their own detail row on this page, only a card on the home "Our
 * Brands" Platform tab). Column labels/subtitles and each platform tile's
 * short caption are read verbatim off the owner's reference screenshot, not
 * paraphrased — they're a different, shorter wording than `PLATFORM_PROGRAMS`'s
 * own `line` copy (used on the home Platform tab cards) for the same five
 * programs. Per-column accent reuses that column's lead operating brand's own
 * `accent` (`data/brands.yml`) rather than inventing new colors.
 *
 * The LE monogram watermark behind this section was already shipped (owner
 * note, 2026-08-08).
 */
interface TreeColumn {
  label: string
  sub: string
  operatingKeys: string[]
  /** PLATFORM_PROGRAMS `num`s that belong in this column, with their short tree caption. */
  platform: { num: string; caption: string }[]
  /** This column's accent — the `data/brands.yml` `accent` of its lead operating brand. */
  accent: string
}

const COLUMNS: TreeColumn[] = [
  {
    label: "Live Events",
    sub: "Sea · In · Out",
    operatingKeys: ["seaside", "inside", "outside"],
    platform: [{ num: "07", caption: "Promoter Network" }], // LP Program
    accent: "#6fb8c9", // seaside
  },
  {
    label: "Media",
    sub: "Content · Creators",
    operatingKeys: ["soundcheck"],
    platform: [
      { num: "08", caption: "Content Studio" }, // LUPFR Media
      { num: "06", caption: "Creator Network" }, // LUPFR VIP
    ],
    accent: "#c9a869", // soundcheck
  },
  {
    label: "Corporate",
    sub: "Venues · Capital",
    operatingKeys: ["highrise"],
    platform: [
      { num: "09", caption: "Venue Partnerships" }, // LUPFR Hospitality
      { num: "10", caption: "Capital · Concepts" }, // LUPFR Ventures
    ],
    accent: "#e08a4a", // highrise
  },
]

function scrollToBrand(key: string): void {
  const el = document.getElementById(`brand-${key}`)
  if (el) el.scrollIntoView({ block: "start", behavior: "smooth" })
}

function BrandTreeNode({ brand }: { brand: BrandItem }) {
  return (
    <button
      type="button"
      onClick={() => scrollToBrand(brand.key)}
      aria-label={`Jump to ${brand.title.replace(/\/\//g, " ")}`}
      className="group flex flex-1 flex-col items-center gap-1 rounded-sm border border-border bg-card px-4 py-3 text-center transition-colors hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5 sm:py-4"
    >
      <span className="font-condensed text-base font-extrabold uppercase tracking-tight text-foreground sm:text-lg">
        <BrandSlashText text={brand.title} color={brand.accent} />
      </span>
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: brand.comingSoon ? "var(--muted-foreground)" : brand.accent }}
          aria-hidden
        />
        {brand.comingSoon ? "Soon" : "Active"}
      </span>
    </button>
  )
}

/** A platform program's tree tile — informational only, no detail row to jump to. */
function PlatformTreeNode({
  program,
  caption,
  accent,
}: {
  program: PlatformProgram
  caption: string
  accent: string
}) {
  return (
    <div
      className="rounded-sm border bg-card/40 px-4 py-2.5 text-center"
      style={{ borderColor: `color-mix(in oklch, ${accent} 40%, var(--border))` }}
    >
      <span className="block font-condensed text-sm font-bold uppercase tracking-tight text-foreground">
        {program.name}
      </span>
      <span className="block font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {caption}
      </span>
    </div>
  )
}

export function BrandTree({ brands }: { brands: BrandItem[] }) {
  const byKey = new Map(brands.map((b) => [b.key, b]))
  const byNum = new Map(PLATFORM_PROGRAMS.map((p) => [p.num, p]))

  return (
    <div className="relative mb-10 overflow-hidden rounded-sm border border-border bg-card/60 px-4 py-8 sm:mb-14 sm:px-8 sm:py-10">
      <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-8">
        Corporate Structure · Tap a brand to explore
      </p>

      <div className="mx-auto mb-8 w-fit rounded-sm px-6 py-3 text-center btn-metallic-gold sm:mb-10">
        <span className="block font-condensed text-xl font-extrabold uppercase tracking-tight sm:text-2xl">LUPFR</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.16em] opacity-80">
          Entertainment · Est. 2025
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const operatingBrands = column.operatingKeys
            .map((k) => byKey.get(k))
            .filter((b): b is BrandItem => !!b)
          // COLUMNS' `num`s are a fixed, hand-verified subset of PLATFORM_PROGRAMS
          // (see the module comment) — the assertion just satisfies the map's
          // return type, not an unchecked runtime assumption.
          const platformItems = column.platform.map(({ num, caption }) => ({
            program: byNum.get(num) as PlatformProgram,
            caption,
          }))

          return (
            <div
              key={column.label}
              role="group"
              aria-label={column.label}
              className="flex flex-col gap-3 rounded-sm border border-border/60 p-4 sm:p-5"
            >
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                {column.label}
              </p>
              <p className="-mt-2 text-center font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {column.sub}
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                {operatingBrands.map((brand) => (
                  <BrandTreeNode key={brand.key} brand={brand} />
                ))}
              </div>

              {/* Every column has at least one platform program (see COLUMNS
                  above), so this always renders — no empty-state to branch on. */}
              <div className="flex flex-col gap-2 border-t border-dashed border-border/60 pt-3">
                {platformItems.map(({ program, caption }) => (
                  <PlatformTreeNode key={program.num} program={program} caption={caption} accent={column.accent} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
