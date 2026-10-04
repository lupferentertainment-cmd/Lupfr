"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CONTACT_PAGE_PATH } from "@/lib/site"

/**
 * 2026-10-04 addition, round 11 (owner: "Across website on mobile - the
 * 'Plan your event' button should be on the bottom of the screen at all
 * times (change it to continue button when in the plan your event section
 * at the bottom)"). Mounted once, globally, in `app/layout.tsx` — a
 * `lg:hidden` bar pinned to the bottom of the viewport on every page,
 * linking to `/contact`.
 *
 * "At all times" except while the visitor is actually in the Contact
 * section itself (`id="contact"` — real on every page it could matter on:
 * the dedicated `/contact` page, and the homepage's embedded Contact
 * section, confirmed via `components/deferred-home-section.tsx`, whose
 * unmounted placeholder already carries the same id, so this finds it
 * immediately either way) — `components/contact.tsx` shows its own
 * sticky Back/Continue/Send Brief bar there instead (see that file), which
 * is the "change it to continue button" half of the owner's ask.
 *
 * Tracks the element's viewport position on scroll/resize rather than a
 * single `IntersectionObserver.observe()` call, because the node it needs
 * to watch gets swapped (DeferredHomeSection's placeholder div -> the real
 * `<section id="contact">`) once Contact mounts; re-querying by id on every
 * check sidesteps ever holding a stale/disconnected observed reference.
 */
export function MobileStickyCta() {
  const [mounted, setMounted] = useState(false)
  const [contactInView, setContactInView] = useState(false)

  useEffect(() => {
    setMounted(true)
    let frame = 0

    function check() {
      frame = 0
      const el = document.getElementById("contact")
      if (!el) {
        setContactInView(false)
        return
      }
      const rect = el.getBoundingClientRect()
      // A generous "meaningful overlap" threshold (not just 1px peeking in)
      // so the handoff with Contact's own sticky bar doesn't flicker right
      // at the section's very edge.
      setContactInView(rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15)
    }

    function onScrollOrResize() {
      if (frame) return
      frame = requestAnimationFrame(check)
    }

    check()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  if (!mounted || contactInView) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#070605]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <Link
        href={CONTACT_PAGE_PATH}
        className="btn-metallic-gold flex w-full items-center justify-center gap-2 rounded-full py-3 font-mono text-xs font-bold uppercase tracking-[0.16em]"
      >
        Plan Your Event <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
