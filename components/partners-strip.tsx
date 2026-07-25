"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import {
  type DragEvent as ReactDragEvent,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { getPartners } from "@/lib/data/partners"
import { ScrollReveal } from "@/components/scroll-reveal"
import { cn } from "@/lib/utils"

const partners = getPartners()
const repeatedPartners = [...partners, ...partners]

const MARQUEE_LOOP_SECONDS = 50 // keep in sync with `partner-marquee-scroll` in app/globals.css
const DRAG_CLICK_THRESHOLD_PX = 12
const FLING_FRICTION = 2.2 // exponential decay rate (s⁻¹) after release
const FLING_MIN_SPEED_PX_S = 8

/**
 * Grab-to-spin engine for the marquee: after hydration (skipped under
 * prefers-reduced-motion) a rAF loop takes over from the CSS keyframe, keeps
 * the same 50s/half-loop auto-advance, and lets pointer drags spin the track
 * with a momentum fling. A drag past the click threshold suppresses the next
 * click so partner links still work on plain clicks.
 */
function useMarqueeSpin() {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)
  const [dragging, setDragging] = useState(false)

  const offsetRef = useRef(0)
  const halfWidthRef = useRef(0)
  const velocityRef = useRef(0)
  const draggingRef = useRef(false)
  const pausedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const lastPointerXRef = useRef(0)
  const lastPointerTimeRef = useRef(0)
  const dragDistanceRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return // reduced motion keeps the static overflow-x fallback row
    }

    // Seed from the keyframe's current position so the takeover doesn't jump.
    try {
      const transform = getComputedStyle(track).transform
      if (transform && transform !== "none") {
        offsetRef.current = new DOMMatrixReadOnly(transform).m41
      }
    } catch {
      offsetRef.current = 0
    }

    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2
    }
    measure()
    window.addEventListener("resize", measure)
    setActive(true)

    let frame = 0
    let lastTime = performance.now()
    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const half = halfWidthRef.current
      if (half > 0) {
        let offset = offsetRef.current
        if (!draggingRef.current) {
          if (velocityRef.current !== 0) {
            offset += velocityRef.current * dt
            velocityRef.current *= Math.exp(-FLING_FRICTION * dt)
            if (Math.abs(velocityRef.current) < FLING_MIN_SPEED_PX_S) {
              velocityRef.current = 0
            }
          } else if (!pausedRef.current) {
            offset -= (half / MARQUEE_LOOP_SECONDS) * dt
          }
        }
        // Both track halves are identical, so wrapping into (-half, 0] loops seamlessly.
        offset %= half
        if (offset > 0) offset -= half
        offsetRef.current = offset
        track.style.transform = `translate3d(${offset}px, 0, 0)`
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", measure)
    }
  }, [])

  const capturedRef = useRef(false)

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!active || e.button !== 0) return
    draggingRef.current = true
    capturedRef.current = false
    setDragging(true)
    dragDistanceRef.current = 0
    velocityRef.current = 0
    lastPointerXRef.current = e.clientX
    lastPointerTimeRef.current = performance.now()
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const now = performance.now()
    const dx = e.clientX - lastPointerXRef.current
    const dt = (now - lastPointerTimeRef.current) / 1000
    lastPointerXRef.current = e.clientX
    lastPointerTimeRef.current = now
    dragDistanceRef.current += Math.abs(dx)
    offsetRef.current += dx
    if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD_PX && !capturedRef.current) {
      capturedRef.current = true
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      } catch {
        // happy-dom / older engines without pointer capture: drag still works
      }
    }
    if (dt > 0) {
      velocityRef.current = velocityRef.current * 0.2 + (dx / dt) * 0.8
    }
  }

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD_PX) {
      suppressClickRef.current = true
    }
    if (capturedRef.current) {
      capturedRef.current = false
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId)
      } catch {
        // capture may never have been taken; nothing to release
      }
    }
  }

  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  const trackProps = {
    ref: trackRef,
    "data-spin": active || undefined,
    "data-dragging": dragging || undefined,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onClickCapture,
    // JS replaces the CSS :hover/:focus-within pause once data-spin is set.
    onMouseEnter: () => { pausedRef.current = true },
    onMouseLeave: () => { pausedRef.current = false },
    onFocus: () => { pausedRef.current = true },
    onBlur: (e: ReactFocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        pausedRef.current = false
      }
    },
    onDragStart: (e: ReactDragEvent<HTMLDivElement>) => e.preventDefault(),
  }

  return trackProps
}

/** Comp parity: partners whose logo asset is still pending (`logo: null` in the
 * comp) render the partner name as freeform mono text — no tile/box chrome. */
function PartnerLabelMark({
  name,
  ariaLabel,
  href,
  isDuplicate,
}: {
  name: string
  ariaLabel: string
  href?: string
  isDuplicate?: boolean
}) {
  return (
    <PartnerLogoShell href={href} ariaLabel={ariaLabel} isDuplicate={isDuplicate}>
      <span className="partner-logo-label whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/85 sm:text-xs">
        {name}
      </span>
    </PartnerLogoShell>
  )
}

function PartnerLogoMark({
  name,
  image,
  imageDark,
  imageClassName,
  ariaLabel,
  href,
  isDuplicate,
}: {
  name: string
  image: string
  imageDark?: string
  imageClassName?: string
  ariaLabel: string
  href?: string
  isDuplicate?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const activeSrc = mounted && resolvedTheme === "dark" && imageDark ? imageDark : image

  return (
    <PartnerLogoShell href={href} ariaLabel={ariaLabel} isDuplicate={isDuplicate}>
      {/* No skeleton tile — a shimmer box reads as a card around the mark. */}
      <Image
        key={activeSrc}
        src={activeSrc}
        alt={name}
        width={280}
        height={90}
        sizes="(max-width: 640px) 7rem, (max-width: 1024px) 9rem, 11rem"
        draggable={false}
        onLoad={() => setReady(true)}
        className={cn(
          "partner-logo-mark object-contain object-center",
          imageClassName,
          // Height after YAML layout classes so freeform strip sizing wins twMerge.
          "h-9 w-auto max-w-[11rem] sm:h-11 md:h-12 lg:h-13",
          "motion-safe:transition-opacity motion-safe:duration-300",
          "motion-reduce:transition-none",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
    </PartnerLogoShell>
  )
}

function PartnerLogoShell({
  href,
  ariaLabel,
  isDuplicate,
  children,
}: {
  href?: string
  ariaLabel: string
  isDuplicate?: boolean
  children: ReactNode
}) {
  // Freeform corporate strip: marks sit on the page background with no
  // bordered/card tiles — natural logo aspect, muted until hover/focus.
  const className = cn(
    "partner-logo-shell group inline-flex h-10 shrink-0 items-center bg-transparent sm:h-12 md:h-14",
    "border-0 shadow-none ring-0",
    "opacity-85 transition-opacity duration-200 ease-snap hover:opacity-100",
    "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  )
  if (!href) return <div className={className} aria-label={ariaLabel}>{children}</div>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      tabIndex={isDuplicate ? -1 : undefined}
    >
      {children}
    </a>
  )
}

/**
 * Slim corporate-partners marquee mounted directly under the hero — a restrained
 * eyebrow only, no big stacked section header.
 */
export function PartnersStrip() {
  const spinTrackProps = useMarqueeSpin()
  return (
    // No tinted band: the section inherits the page background entirely — pure
    // white in light, pure dark in dark (owner request 2026-07-11).
    <section
      aria-label="Corporate partners"
      data-partners-chrome="freeform"
      className="relative py-6 sm:py-8"
    >
      {/* leading-none: the kicker's inherited 1.5 line-height is fractional at
          11px (16.5px box) and shifts every downstream section anchor onto a
          fractional boundary, tripping the nav scroll-spy gate. */}
      <p className="lupfr-section-kicker mb-3 text-center leading-none sm:mb-4">
        Corporate Partners
      </p>
      {/* Full-bleed: the logo row deliberately escapes the max-w container so the
          marquee runs edge-to-edge on all viewports (owner request 2026-07-08). */}
      <ScrollReveal variant="up" className="partner-marquee w-full py-1 sm:py-2">
        <div
          {...spinTrackProps}
          className={cn(
            "partner-marquee-track flex items-center gap-x-10",
            "sm:gap-x-12 md:gap-x-14 lg:gap-x-16"
          )}
        >
          {[false, true].map((isDuplicate) => (
            <div
              key={isDuplicate ? "duplicate" : "primary"}
              aria-hidden={isDuplicate || undefined}
              className={cn(
                "flex shrink-0 items-center gap-x-10",
                "sm:gap-x-12 md:gap-x-14 lg:gap-x-16"
              )}
            >
              {repeatedPartners.map((p, idx) =>
                p.image ? (
                  <PartnerLogoMark
                    key={`${p.name}-${isDuplicate ? "dup" : "pri"}-${idx}`}
                    name={p.name}
                    image={p.image}
                    imageDark={p.imageDark}
                    imageClassName={p.imageClassName}
                    ariaLabel={p.ariaLabel ?? p.name}
                    href={p.url}
                    isDuplicate={isDuplicate}
                  />
                ) : (
                  <PartnerLabelMark
                    key={`${p.name}-${isDuplicate ? "dup" : "pri"}-${idx}`}
                    name={p.name}
                    ariaLabel={p.ariaLabel ?? p.name}
                    href={p.url}
                    isDuplicate={isDuplicate}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
