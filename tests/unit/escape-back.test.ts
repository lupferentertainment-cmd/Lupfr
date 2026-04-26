/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { GALLERY_FROM_PARAM } from "@/lib/gallery-nav"
import {
  getEscapeBackHref,
  isDocumentBlockingEscapeBack,
  isEscapeBackFormFieldTarget,
} from "@/lib/escape-back"

describe("escape-back", () => {
  describe("getEscapeBackHref", () => {
    it("sends /gallery/p/* to /gallery or /#gallery from ?from=", () => {
      expect(getEscapeBackHref("/gallery/p/1", "")).toBe("/gallery")
      expect(getEscapeBackHref("/gallery/p/1", `?${GALLERY_FROM_PARAM}=gallery`)).toBe(
        "/gallery"
      )
      expect(getEscapeBackHref("/gallery/p/1", `?${GALLERY_FROM_PARAM}=home`)).toBe(
        "/#gallery"
      )
    })

    it("sends event detail to /#events", () => {
      expect(getEscapeBackHref("/events/boiler-boat", "")).toBe("/#events")
    })

    it("sends /gallery index to /#gallery", () => {
      expect(getEscapeBackHref("/gallery", "")).toBe("/#gallery")
    })

    it("sends legal pages and contact page home", () => {
      expect(getEscapeBackHref("/privacy", "")).toBe("/")
      expect(getEscapeBackHref("/terms", "")).toBe("/")
      expect(getEscapeBackHref("/contact", "")).toBe("/")
    })

    it("returns null when there is no primary back target", () => {
      expect(getEscapeBackHref("/", "")).toBeNull()
    })
  })

  describe("isDocumentBlockingEscapeBack", () => {
    it("is true when nav menu is open", () => {
      const doc = {
        querySelector: (sel: string) =>
          String(sel).includes("data-lupfr-nav-menu-open") ? ({} as Element) : null,
      } as unknown as Document
      expect(isDocumentBlockingEscapeBack(doc)).toBe(true)
    })

    it("is true when Radix dialog content is open", () => {
      const doc = {
        querySelector: (sel: string) =>
          String(sel).includes("dialog-content") && String(sel).includes("data-state")
            ? ({} as Element)
            : null,
      } as unknown as Document
      expect(isDocumentBlockingEscapeBack(doc)).toBe(true)
    })

    it("is false when no blocking layer is present", () => {
      const doc = { querySelector: () => null } as unknown as Document
      expect(isDocumentBlockingEscapeBack(doc)).toBe(false)
    })
  })

  describe("isEscapeBackFormFieldTarget", () => {
    it("is false for null and non-Element targets", () => {
      expect(isEscapeBackFormFieldTarget(null)).toBe(false)
      expect(isEscapeBackFormFieldTarget(new EventTarget())).toBe(false)
    })

    it("is true when target is or is inside a form field", () => {
      const input = document.createElement("input")
      expect(isEscapeBackFormFieldTarget(input)).toBe(true)
    })
  })
})
