"use client"

import { useInView } from "framer-motion"
import { useEffect, useRef } from "react"
import { useClientPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

/**
 * Oct 1 2026 homepage redesign: shared muted/looping background video for the
 * "Featured Experiences" case studies and the "Media & News" watch section.
 * Matches the performance spec from Will's own "LUPFR Website Design NEW/
 * Website Fix Notes.md": don't download until on screen, pause when scrolled
 * away, muted, poster shows instantly, photo-only on reduced-motion. There's
 * no Data Saver / connection-type signal available via React DOM APIs, so
 * that part of the spec is covered by reduced-motion + preload="none" instead
 * (no eager byte cost on any connection until the clip is actually in view).
 */
export function LazyLoopVideo({
  srcMp4,
  srcWebm,
  poster,
  className,
  suspended = false,
}: {
  srcMp4: string
  /** Optional — omitted for clips that only exist as .mp4 (e.g. the Hero's
   * real video assets under public/hero/, which predate this redesign's
   * webm-pair convention and have no re-encoded webm sibling). */
  srcWebm?: string
  poster: string
  className?: string
  /** True while the clip is on screen but hidden behind something else (e.g. a covered sticky
   * "Stack" card). Covered clips stay paused so only the visible one decodes. */
  suspended?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.35 })
  // Start fetching a little before the clip arrives so it can play the moment it is on screen
  // (preload="none" + play() on arrival left a gap where the poster sat frozen, and a rejected
  // play() was never retried). `once` — once buffering has started there's no reason to undo it.
  const isNear = useInView(ref, { once: true, margin: "600px 0px 600px 0px" })
  const reducedMotion = useClientPrefersReducedMotion()
  const shouldPlay = isInView && !suspended

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion) return
    if (!shouldPlay) {
      el.pause()
      return
    }
    const tryPlay = () => {
      const playPromise = el.play()
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {})
    }
    tryPlay()
    // If play() was rejected because no data had loaded yet, retry once data arrives.
    el.addEventListener("loadeddata", tryPlay)
    el.addEventListener("canplay", tryPlay)
    return () => {
      el.removeEventListener("loadeddata", tryPlay)
      el.removeEventListener("canplay", tryPlay)
    }
  }, [shouldPlay, reducedMotion])

  if (reducedMotion) {
    // eslint-disable-next-line @next/next/no-img-element -- poster-only fallback, not a next/image candidate (decorative background fill)
    return <img src={poster} alt="" className={className} />
  }

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload={isNear || shouldPlay ? "auto" : "none"}
      poster={poster}
      className={className}
    >
      {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
      <source src={srcMp4} type="video/mp4" />
    </video>
  )
}
