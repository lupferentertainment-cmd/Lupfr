const PARTIFUL_PROFILE_URL = "https://partiful.com/u/0SHzuWD8fZTwWwVJixNo"

/**
 * "Every ticket lives on Partiful" band — owner restructure note, 2026-08-28:
 * "New: Partiful band under the events grid linking to [profile] — all
 * ticketing runs through Partiful now" (also placed under the home Our
 * Brands grid per the same design-canvas component). Copy/link ported
 * verbatim from the design canvas's `.lp-partiful-band`.
 */
export function PartifulBand({ className = "" }: { className?: string }) {
  return (
    <a
      href={PARTIFUL_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-10 flex flex-wrap items-center justify-between gap-5 rounded-sm border border-border bg-card px-5 py-5 sm:px-6 transition-colors hover:border-accent/50 ${className}`}
    >
      <span className="flex min-w-0 items-center gap-4">
        {/* No Partiful brand asset ships in this repo — a plain glyph mark
           avoids reproducing their logo without a supplied file. */}
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-condensed text-lg font-extrabold text-foreground"
          style={{ backgroundColor: "rgba(201,168,105,0.14)" }}
          aria-hidden
        >
          P
        </span>
        <span className="min-w-0">
          <span className="block font-condensed text-lg font-extrabold uppercase tracking-tight text-foreground sm:text-xl">
            Every ticket lives on Partiful
          </span>
          <span className="mt-1 block font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">
            RSVPS · GUEST LISTS · EVERY LUPFR EVENT IN ONE PLACE
          </span>
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full btn-metallic-gold px-6 py-3 text-sm font-semibold">
        Get Tickets <span aria-hidden>→</span>
      </span>
    </a>
  )
}
