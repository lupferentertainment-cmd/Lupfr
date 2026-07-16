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
const deferredSection = fs.readFileSync(path.join(rootDir, "components", "deferred-home-section.tsx"), "utf8")
const navigation = fs.readFileSync(path.join(rootDir, "components", "navigation.tsx"), "utf8")
const siteConfig = fs.readFileSync(path.join(rootDir, "lib", "site.ts"), "utf8")
const heroDesktop = fs.readFileSync(path.join(rootDir, "components", "hero-desktop.tsx"), "utf8")
const heroMobile = fs.readFileSync(path.join(rootDir, "components", "hero-mobile-static.tsx"), "utf8")
const eventsComponent = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")
const servicesComponent = fs.readFileSync(path.join(rootDir, "components", "services.tsx"), "utf8")
const artistsComponent = fs.readFileSync(path.join(rootDir, "components", "artists.tsx"), "utf8")
const contact = fs.readFileSync(path.join(rootDir, "components", "contact.tsx"), "utf8")
const phoneListPopup = fs.readFileSync(path.join(rootDir, "components", "phone-list-popup.tsx"), "utf8")
const footer = fs.readFileSync(path.join(rootDir, "components", "footer.tsx"), "utf8")
const about = fs.readFileSync(path.join(rootDir, "components", "about.tsx"), "utf8")
const partnersStrip = fs.readFileSync(path.join(rootDir, "components", "partners-strip.tsx"), "utf8")
const protectedPhone = fs.readFileSync(path.join(rootDir, "components", "protected-phone.tsx"), "utf8")

function getContactPhoneCodes() {
  const match = protectedPhone.match(/const PHONE_CHAR_CODES = \[([^\]]+)\]/)
  if (!match) throw new Error("PHONE_CHAR_CODES missing")
  return match[1].split(",").map((value) => Number(value.trim()))
}

function getContactPhoneText() {
  return String.fromCharCode(...getContactPhoneCodes())
}

// ── typography ────────────────────────────────────────────────────────────────

describe("typography system", () => {
  it("defines Work Sans (via next/font variable) as the sans-serif body font (corporate redesign 2026-07-15)", () => {
    expect(css).toMatch(/--font-sans:\s*var\(--font-work-sans\)[^;]*'Work Sans'/)
  })

  it("defines Playfair Display (via next/font variable) as the serif display font", () => {
    expect(css).toMatch(/--font-serif:\s*var\(--font-playfair-display\)[^;]*'Playfair Display'/)
  })

  it("defines Barlow Condensed (via next/font variable) as the condensed display font for eyebrows/labels", () => {
    expect(css).toMatch(/--font-condensed:\s*var\(--font-barlow-condensed\)[^;]*'Barlow Condensed'/)
  })

  it("defines Space Mono (via next/font variable) as the monospace font", () => {
    expect(css).toMatch(/--font-mono:\s*var\(--font-space-mono\)[^;]*'Space Mono'/)
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

  it("footer eyebrow stays sentence case — the mono/uppercase corporate label is scoped to section kickers only", () => {
    expect(css).toMatch(/\.lupfr-heading-eyebrow\s*\{[^}]*\}/)
    const eyebrowBlock = css.match(/\.lupfr-heading-eyebrow\s*\{[^}]*\}/)![0]
    expect(eyebrowBlock).not.toContain("text-transform")
  })

  it("defines the corporate section-kicker eyebrow (mono, uppercase, wide-tracked; owner redesign 2026-07-15)", () => {
    expect(css).toContain(".lupfr-section-kicker")
    expect(css).toMatch(/\.lupfr-section-kicker\s*\{[^}]*font-family:\s*var\(--font-mono\)/)
    expect(css).toMatch(/\.lupfr-section-kicker\s*\{[^}]*text-transform:\s*uppercase/)
    expect(css).toMatch(/\.lupfr-section-kicker\s*\{[^}]*letter-spacing:\s*0\.2em/)
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
    const expected = ["#events", "#services", "#artists", "#about", "#team", "#contact"]
    for (const href of expected) {
      expect(navigation, `nav missing link to ${href}`).toContain(`href: "${href}"`)
    }
  })

  it("no longer links the retired standalone gallery section", () => {
    expect(navigation).not.toContain('href: "#gallery"')
    expect(footer).not.toContain('"Gallery"')
  })

  it("hides the Blog page link while public access is disabled", () => {
    expect(siteConfig).toContain("BLOG_PUBLIC_ACCESS_ENABLED = false")
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

  it("defers news, about, team, contact behind intersection observer; the standalone gallery section is retired", () => {
    expect(homePage).toContain('<DeferredHomeSection id="news"')
    expect(homePage).not.toContain('id="gallery"')
    expect(homePage).toContain('id="about"')
    expect(homePage).toContain('id="team"')
    expect(homePage).toContain('id="contact"')
  })

  it("mounts the corporate partners strip directly under the hero, without the stats section", () => {
    expect(homePage).toContain('import { PartnersStrip } from "@/components/partners-strip"')
    expect(homePage).toMatch(/<Hero \/>\s*<PartnersStrip \/>/)
    expect(homePage).not.toContain("Reviews")
    expect(fs.existsSync(path.join(rootDir, "components", "reviews.tsx"))).toBe(false)
  })

  it("partners strip keeps the marquee but drops the big section header; services no longer owns partners", () => {
    expect(partnersStrip).toContain("partner-marquee")
    expect(partnersStrip).not.toContain("lupfr-heading-stack")
    expect(servicesComponent).not.toContain("partner-marquee")
    expect(servicesComponent).not.toContain("getPartners")
  })

  it("partners marquee row is full-bleed with no visible section text (owner requests 2026-07-08 / 2026-07-11)", () => {
    // No eyebrow paragraph at all — the section is named via aria-label only,
    // and the logo row spans the full viewport on desktop and mobile.
    expect(partnersStrip).not.toMatch(/Corporate partners\s*<\/p>/)
    expect(partnersStrip).toContain('aria-label="Corporate partners"')
    expect(partnersStrip).toMatch(/className="partner-marquee[^"]*"/)
  })

  it("every home section has a scroll-reveal entrance (Artists was the last static one)", () => {
    // Artists' useInView only lazy-mounts embeds — the section entrance must
    // come from ScrollReveal like its siblings (owner request 2026-07-11).
    expect(artistsComponent).toContain('import { ScrollReveal } from "@/components/scroll-reveal"')
    expect(artistsComponent).toMatch(/<ScrollReveal variant="up"/)
  })

  it("events section renders the Instagram reels block", () => {
    expect(eventsComponent).toContain('from "@/lib/data/reels"')
    expect(eventsComponent).toContain("Reels")
    expect(eventsComponent).toContain("instagramReels")
  })

  it("mounts Events eagerly for instant #events navigation", () => {
    expect(homePage).toContain('import { Events } from "@/components/events"')
    expect(homePage).toContain("<Events />")
  })

  it("uses DeferredHomeSection for below-fold sections", () => {
    expect(homePage).toContain("DeferredHomeSection")
    expect(deferredSection).toContain("IntersectionObserver")
  })

  it("uses a tight mobile observer margin to avoid premature loads", () => {
    expect(deferredSection).toContain("DEFERRED_SECTION_ROOT_MARGIN_MOBILE")
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

// ── contact structure ────────────────────────────────────────────────────────

describe("contact structure", () => {
  it("decodes the current public call number", () => {
    expect(getContactPhoneText()).toBe("(323) 366-9246")
  })

  it("uses neutral visitor phone placeholders", () => {
    expect(contact).toContain('placeholder="Your phone number"')
  })

  it("uses neutral popup phone placeholders", () => {
    expect(phoneListPopup).toContain('placeholder="Your phone number"')
  })

  it("drops the 'Ready to elevate' card and moves its subtext under the heading", () => {
    expect(contact).not.toContain("Ready to elevate your event?")
    expect(contact).toContain("Whether you're planning a corporate event")
  })

  it("no longer renders the email/location/phone info cards (they live in the footer)", () => {
    expect(contact).not.toContain("Email us")
    expect(contact).not.toContain("Based in")
    expect(contact).not.toContain("Call us")
    expect(contact).not.toContain("ProtectedPhone")
  })
})

// ── footer contact info ──────────────────────────────────────────────────────

describe("footer contact info", () => {
  it("footer carries email, location, and the protected phone", () => {
    expect(footer).toContain("will@lupfr.com")
    expect(footer).toContain("SF &amp; LA, California")
    expect(footer).toContain("ProtectedPhone")
  })
})

// ── about structure ──────────────────────────────────────────────────────────

describe("about structure", () => {
  it("drops the founder portrait (face lives in the Team section below)", () => {
    expect(about).not.toContain("will_lupfer.webp")
  })

  it("closes with the founder byline at the bottom", () => {
    expect(about).toContain("Will Lupfer — CEO &amp; Founder of LUPFR Entertainment")
  })
})

// ── event card desktop sizing ────────────────────────────────────────────────

describe("event card desktop sizing", () => {
  it("caps event card images at a more viewable desktop height", () => {
    expect(eventsComponent).not.toContain("lg:h-[400px]")
    expect(eventsComponent).not.toContain("md:h-[340px]")
    expect(eventsComponent).toContain("md:h-[260px] lg:h-[280px]")
  })

  it("narrows the desktop carousel card so more events are viewable at once", () => {
    expect(eventsComponent).not.toContain("lg:basis-[min(640px,48%)]")
    expect(eventsComponent).toContain("lg:basis-[min(480px,33%)]")
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
