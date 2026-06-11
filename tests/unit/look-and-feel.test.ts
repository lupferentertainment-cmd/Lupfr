/**
 * Look-and-feel guardrails — visual, typographic, and structural contracts.
 *
 * These tests assert the CSS token system, component class usage, page
 * structure, and navigation link inventory so a visual drift (wrong font,
 * missing gold class, dropped section ID, broken stacking context) fails
 * CI before any visitor sees it.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const css = fs.readFileSync(path.join(rootDir, "app", "globals.css"), "utf8")
const homePage = fs.readFileSync(path.join(rootDir, "components", "home-page.tsx"), "utf8")
const navigation = fs.readFileSync(path.join(rootDir, "components", "navigation.tsx"), "utf8")
const heroDesktop = fs.readFileSync(path.join(rootDir, "components", "hero-desktop.tsx"), "utf8")
const heroMobile = fs.readFileSync(path.join(rootDir, "components", "hero-mobile-static.tsx"), "utf8")
const eventsComponent = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")
const servicesComponent = fs.readFileSync(path.join(rootDir, "components", "services.tsx"), "utf8")
const artistsComponent = fs.readFileSync(path.join(rootDir, "components", "artists.tsx"), "utf8")
const footer = fs.readFileSync(path.join(rootDir, "components", "footer.tsx"), "utf8")

// ── typography ────────────────────────────────────────────────────────────────

describe("typography system", () => {
  it("defines Space Grotesk as the sans-serif body font", () => {
    expect(css).toContain("--font-sans: 'Space Grotesk'")
  })

  it("defines Playfair Display as the serif display font", () => {
    expect(css).toContain("--font-serif: 'Playfair Display'")
  })

  it("defines Geist Mono as the monospace font", () => {
    expect(css).toContain("--font-mono: 'Geist Mono'")
  })

  it("applies serif font to blockquote elements", () => {
    expect(css).toContain("font-family: var(--font-serif)")
  })

  it("section titles use font-serif and tracking-tighter", () => {
    expect(css).toContain(".lupfr-section-title")
    expect(css).toMatch(/\.lupfr-section-title[\s\S]{0,200}font-serif/)
    expect(css).toMatch(/\.lupfr-section-title[\s\S]{0,200}tracking-tighter/)
  })

  it("subsection title class is defined", () => {
    expect(css).toContain(".lupfr-subsection-title")
  })

  it("heading eyebrow class is defined", () => {
    expect(css).toContain(".lupfr-heading-eyebrow")
  })
})

// ── border-radius system ──────────────────────────────────────────────────────

describe("border-radius token system", () => {
  it("base --radius is 0.75rem", () => {
    expect(css).toContain("--radius: 0.75rem")
  })

  it("defines --radius-sm, --radius-md, --radius-lg, --radius-xl scale", () => {
    expect(css).toContain("--radius-sm:")
    expect(css).toContain("--radius-md:")
    expect(css).toContain("--radius-lg:")
    expect(css).toContain("--radius-xl:")
  })
})

// ── gold visual system ────────────────────────────────────────────────────────

describe("gold visual system", () => {
  it("defines .text-metallic-gold for metallic text treatment", () => {
    expect(css).toContain(".text-metallic-gold {")
  })

  it("defines .gold-unison-gradient for unified gradient panels", () => {
    expect(css).toContain(".gold-unison-gradient {")
  })

  it("defines .text-metallic-gold-shimmer for animated shimmer variant", () => {
    expect(css).toContain(".text-metallic-gold-shimmer {")
  })

  it("defines .heading-metallic-gold for heading-level treatment", () => {
    expect(css).toContain(".heading-metallic-gold {")
  })

  it("defines .gold-shine-text for the GoldShineText component", () => {
    expect(css).toContain(".gold-shine-text {")
  })

  it("defines .text-gold-accent for accent text", () => {
    expect(css).toContain(".text-gold-accent {")
  })

  it("gold button class .btn-metallic-gold is defined with hover state", () => {
    expect(css).toContain(".btn-metallic-gold {")
    expect(css).toContain(".btn-metallic-gold:hover {")
  })

  it("brass button class .btn-metallic-brass is defined", () => {
    expect(css).toContain(".btn-metallic-brass {")
  })
})

// ── hero visual system ────────────────────────────────────────────────────────

describe("hero visual system", () => {
  it("defines .hero-title-lupfr and .hero-title-entertainment classes", () => {
    expect(css).toContain(".hero-title-lupfr {")
    expect(css).toContain(".hero-title-entertainment {")
  })

  it("defines .hero-entertainment-gradient for the coloured ENTERTAINMENT line", () => {
    expect(css).toContain(".hero-entertainment-gradient {")
  })

  it("hero desktop uses hero-entertainment-text for the Entertainment line", () => {
    expect(heroDesktop).toContain("hero-entertainment-text")
  })

  it("hero desktop references hero-title-lupfr and hero-title-entertainment classes", () => {
    expect(heroDesktop).toContain("hero-title-lupfr")
    expect(heroDesktop).toContain("hero-title-entertainment")
  })

  it("hero desktop uses hero-title-lupfr for the LUPFR wordmark wrapper", () => {
    expect(heroDesktop).toContain("hero-title-lupfr")
  })

  it(".stat-tile-surface is defined for metric card backgrounds", () => {
    expect(css).toContain(".stat-tile-surface {")
  })
})

// ── partner logo system ───────────────────────────────────────────────────────

describe("partner logo CSS system", () => {
  it("base .partner-logo class is defined", () => {
    expect(css).toContain(".partner-logo {")
  })

  it("outline treatment class is defined", () => {
    expect(css).toContain(".partner-logo.partner-logo--outline {")
  })

  it("solid treatment class is defined", () => {
    expect(css).toContain(".partner-logo.partner-logo--solid {")
  })

  it("natural treatment class is defined", () => {
    expect(css).toContain(".partner-logo.partner-logo--natural {")
  })

  it("dark-mode overrides exist for each treatment", () => {
    expect(css).toContain(".dark .partner-logo.partner-logo--outline {")
    expect(css).toContain(".dark .partner-logo.partner-logo--solid {")
    expect(css).toContain(".dark .partner-logo.partner-logo--natural {")
  })

  it("chip variant is defined for compact partner display", () => {
    expect(css).toContain(".partner-logo-chip {")
  })
})

// ── navigation structure ──────────────────────────────────────────────────────

describe("navigation structure", () => {
  it("defines all expected section nav links", () => {
    const expected = ["#events", "#services", "#artists", "#gallery", "#about", "#contact"]
    for (const href of expected) {
      expect(navigation, `nav missing link to ${href}`).toContain(`href: "${href}"`)
    }
  })

  it("includes the Blog page link", () => {
    expect(navigation).toContain('href: "/blog"')
  })

  it("uses lupfr-site-header class for the fixed header", () => {
    expect(navigation).toContain("lupfr-site-header")
  })

  it("applies z-[60] to the fixed header so it clears all content layers", () => {
    expect(navigation).toContain("z-[60]")
  })

  it("applies z-[55] to the mobile overlay so it sits below the header", () => {
    expect(navigation).toContain("z-[55]")
  })

  it("uses data-lupfr-nav-state for stateful veil transitions", () => {
    expect(navigation).toContain("data-lupfr-nav-state")
  })

  it("uses next/link for client-side prefetching", () => {
    expect(navigation).toContain('from "next/link"')
  })

  it("tracks active section with scroll-position spy using a fixed offset", () => {
    expect(navigation).toContain("SECTION_SPY_OFFSET_PX")
  })
})

// ── home page section structure ───────────────────────────────────────────────

describe("home page section structure", () => {
  it("events component owns the #events section anchor", () => {
    expect(eventsComponent).toContain('id="events"')
  })

  it("services component owns the #services section anchor", () => {
    expect(servicesComponent).toContain('id="services"')
  })

  it("artists component owns the #artists section anchor", () => {
    expect(artistsComponent).toContain('id="artists"')
  })

  it("defers news, gallery, about, contact behind intersection observer", () => {
    expect(homePage).toContain('id="news"')
    expect(homePage).toContain('id="gallery"')
    expect(homePage).toContain('id="about"')
    expect(homePage).toContain('id="contact"')
  })

  it("mounts Events eagerly for instant #events navigation", () => {
    expect(homePage).toContain('import { Events } from "@/components/events"')
    expect(homePage).toContain("<Events />")
  })

  it("uses DeferredHomeSection for below-fold sections", () => {
    expect(homePage).toContain("DeferredHomeSection")
    expect(homePage).toContain("IntersectionObserver")
  })

  it("uses a tight mobile observer margin to avoid premature loads", () => {
    expect(homePage).toContain("DEFERRED_SECTION_ROOT_MARGIN_MOBILE")
  })
})

// ── footer ────────────────────────────────────────────────────────────────────

describe("footer structure", () => {
  it("includes a copyright notice with LUPFR name", () => {
    expect(footer.toLowerCase()).toContain("lupfr")
  })

  it("contains navigation links back to key sections", () => {
    expect(footer).toContain("href")
  })
})

// ── animation system ──────────────────────────────────────────────────────────

describe("animation system", () => {
  it("defines float animation keyframes with delay variants", () => {
    expect(css).toContain(".animate-float {")
    expect(css).toContain(".animate-float-delay-1 {")
    expect(css).toContain(".animate-float-delay-2 {")
    expect(css).toContain(".animate-float-delay-3 {")
    expect(css).toContain(".animate-float-delay-4 {")
  })
})

// ── heading split system ──────────────────────────────────────────────────────

describe("heading split / subline system", () => {
  it("defines .lupfr-heading-split-leading for multi-line gold headings", () => {
    expect(css).toContain(".lupfr-heading-split-leading {")
  })

  it("defines .lupfr-heading-subline for the second-line contrast treatment", () => {
    expect(css).toContain(".lupfr-heading-subline {")
  })

  it("defines the soft variant for muted subline color", () => {
    expect(css).toContain(".lupfr-heading-subline--soft {")
  })

  it("defines .lupfr-heading-stack for stacked display compositions", () => {
    expect(css).toContain(".lupfr-heading-stack {")
    expect(css).toContain(".lupfr-heading-stack--tight {")
  })
})
