"use client"

/**
 * VIEW DECK — an ordered pitch deck (HIGH//RISE, LUPFR) shown as a full-screen
 * viewer. Slides are static WebP under public/brands/; paging is arrow keys or
 * the on-frame chevrons, matching the gallery lightbox's control language.
 */
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Presentation } from "lucide-react"

import { ShimmerImage } from "@/components/shimmer-image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function BrandDeck({
  slides,
  label,
  className,
}: {
  /** Ordered site-root slide paths. */
  slides: string[]
  /** Plain-text deck name for the trigger + dialog title (e.g. "HIGH RISE"). */
  label: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const count = slides.length

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1)
      else if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, go])

  // Always reopen on the first slide so the deck reads as a deck.
  useEffect(() => {
    if (open) setIndex(0)
  }, [open])

  if (count === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-2",
          "font-mono text-[11px] uppercase tracking-[0.1em] text-accent",
          "transition-colors hover:border-accent hover:bg-accent/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        aria-label={`View the ${label} deck — ${count} slides`}
      >
        <Presentation size={13} aria-hidden />
        View deck
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(94vw,900px)] border-border bg-card p-3 sm:p-4">
          <DialogTitle className="sr-only">{`${label} deck`}</DialogTitle>

          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-muted">
            <ShimmerImage
              key={slides[index]}
              src={slides[index]}
              alt={`${label} deck — slide ${index + 1} of ${count}`}
              fill
              sizes="(max-width: 768px) 94vw, 900px"
              className="object-contain"
            />

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous slide"
                  className="absolute left-2 top-1/2 z-[2] flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next slide"
                  className="absolute right-2 top-1/2 z-[2] flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <ChevronRight size={18} aria-hidden />
                </button>
              </>
            ) : null}
          </div>

          <p
            className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
            aria-live="polite"
          >
            {index + 1} / {count}
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
