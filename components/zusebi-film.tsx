"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

/**
 * Featured Zusebi set (LUPFR Website Design v16): a poster button that opens
 * the full YouTube set in an in-page modal (nocookie embed, starts at the
 * set's first track). Used by the home "Media & News" lead and the /media
 * featured tile — same video, same modal, so one component owns both.
 * Dialog semantics: Esc / backdrop / × close, focus moves to × and returns
 * to the button, body scroll locked while open.
 */
export const ZUSEBI_VIDEO_ID = "2w09dEQpz2E"
export const ZUSEBI_START_SECONDS = 4034
export const ZUSEBI_EMBED_SRC = `https://www.youtube-nocookie.com/embed/${ZUSEBI_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1&start=${ZUSEBI_START_SECONDS}`
export const ZUSEBI_WATCH_URL = `https://youtu.be/${ZUSEBI_VIDEO_ID}?t=${ZUSEBI_START_SECONDS}`

export function ZusebiFilmButton({ className, children }: { className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Watch Zusebi live at Golden Gate Park"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,4,3,0.92)] p-[clamp(16px,4vw,64px)]"
              onClick={close}
              data-testid="film-modal"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Zusebi · Live at Golden Gate Park"
                onClick={(e) => e.stopPropagation()}
                className="flex w-[min(1280px,100%)] flex-col gap-3.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <a
                    href={ZUSEBI_WATCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10.5px] tracking-[0.14em] text-[rgba(243,239,230,0.7)] no-underline hover:text-[#f3efe6]"
                  >
                    OPEN ON YOUTUBE ↗
                  </a>
                  <button
                    ref={closeRef}
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    className="size-10 rounded-full border border-[rgba(243,239,230,0.35)] bg-transparent text-lg leading-none text-[#f3efe6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a869]"
                  >
                    ×
                  </button>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-[3px] bg-black">
                  <iframe
                    src={ZUSEBI_EMBED_SRC}
                    title="Zusebi · Live at Golden Gate Park"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
