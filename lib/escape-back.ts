import { GALLERY_FROM_PARAM, galleryPhotoPageBackHref, isGalleryFrom } from "@/lib/gallery-nav"

/**
 * Path to use when the user presses Escape, matching the primary on-page
 * "Back" / "All photos" / "Back to Events" affordances.
 */
export function getEscapeBackHref(pathname: string, search: string): string | null {
  if (pathname.startsWith("/gallery/p/")) {
    const sp = new URLSearchParams(search)
    const raw = sp.get(GALLERY_FROM_PARAM)
    const from = isGalleryFrom(raw) ? raw : null
    return galleryPhotoPageBackHref(from)
  }
  if (/^\/events\/[^/]+$/.test(pathname)) {
    return "/#events"
  }
  if (pathname === "/gallery") {
    return "/#gallery"
  }
  if (pathname === "/privacy" || pathname === "/terms" || pathname === "/contact") {
    return "/"
  }
  return null
}

/** True when a modal, drawer, or other layer should consume Escape first. */
export function isDocumentBlockingEscapeBack(doc: Document): boolean {
  if (doc.querySelector('[data-lupfr-nav-menu-open="true"]')) return true
  if (doc.querySelector('[data-lupfr-phone-list-open="true"]')) return true
  if (doc.querySelector('[data-slot="dialog-content"][data-state="open"]')) return true
  return false
}

export function isEscapeBackFormFieldTarget(target: EventTarget | null): boolean {
  if (typeof Element === "undefined" || !target) return false
  if (!(target instanceof Element)) return false
  return target.closest("input, textarea, select, [contenteditable='true']") !== null
}
