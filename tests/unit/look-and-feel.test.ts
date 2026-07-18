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
const heroShared = fs.readFileSync(path.join(rootDir, "components", "hero-shared.tsx"), "utf8")
const eventsComponent = fs.readFileSync(path.join(rootDir, "components", "events.tsx"), "utf8")
const servicesComponent = fs.readFileSync(path.join(rootDir, "components", "services.tsx"), "utf8")
const artistsComponent = fs.readFileSync(path.join(rootDir, "components", "artists.tsx"), "utf8")
const contact = fs.readFileSync(path.join(rootDir, "components", "contact.tsx"), "utf8")
const phoneListPopup = fs.readFileSync(path.join(rootDir, "components", "phone-list-popup.tsx"), "utf8")
const footer = fs.readFileSync(path.join(rootDir, "components", "footer.tsx"), "utf8")
const about = fs.readFileSync(path.join(rootDir, "components", "about.tsx"), "utf8")
const partnersStrip = fs.readFileSync(path.join(rootDir, "components", "partners-strip.tsx"), "utf8")
const brandsComponent = fs.readFileSync(path.join(rootDir, "components", "brands.tsx"), "utf8")
const notFoundPage = fs.readFileSync(path.join(rootDir, "app", "not-found.tsx"), "utf8")
const protectedPhone = fs.readFileSync(path.join(rootDir, "components", "protected-phone.tsx"), "utf8")
const team = fs.readFileSync(path.join(rootDir, "components", "team.tsx"), "utf8")
const careers = fs.readFileSync(path.join(rootDir, "components", "careers.tsx"), "utf8")

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

  it("main h1/h2 use the corporate condensed/uppercase display treatment (phase 19, ported from the comp's bound titleFont='Barlow Condensed', titleTransform='uppercase', titleWeight=800)", () => {
    expect(css).toMatch(/main h1,\s*\n\s*main h2\s*\{[\s\S]{0,200}font-condensed/)
    expect(css).toMatch(/main h1,\s*\n\s*main h2\s*\{[\s\S]{0,200}uppercase/)
    expect(css).toMatch(/main h1,\s*\n\s*main h2\s*\{[\s\S]{0,200}font-extrabold/)
  })

  it("does not define the dead .lupfr-section-title/.lupfr-subsection-title classes (unused since before phase 19, superseded by the main h1/h2 rule + .lupfr-heading-sub)", () => {
    expect(css).not.toContain(".lupfr-section-title")
    expect(css).not.toContain(".lupfr-subsection-title")
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

// ── corporate section eyebrows (owner redesign 2026-07-15) ─────────────────────

describe("corporate section eyebrows", () => {
  it("Services, Team, About, Artists, and Careers eyebrows use the corporate kicker class", () => {
    expect(servicesComponent).toMatch(/className="lupfr-section-kicker[^"]*"[\s\S]{0,200}>\s*What We Do/)
    expect(team).toMatch(/className="lupfr-section-kicker[^"]*">Who We Are/)
    expect(about).toMatch(/className="lupfr-section-kicker[^"]*">About LUPFR/)
    expect(artistsComponent).toMatch(/className="lupfr-section-kicker[^"]*"[\s\S]{0,200}>\s*The Sound/)
    expect(careers).toMatch(/className="lupfr-section-kicker[^"]*"[\s\S]{0,200}>\s*Join the Team/)
    expect(brandsComponent).toMatch(/className="lupfr-section-kicker[^"]*"[\s\S]{0,200}>\s*The Portfolio/)
    expect(notFoundPage).toMatch(/className="lupfr-section-kicker[^"]*">404/)
  })

  it("Contact's section eyebrow (above the h2) uses the kicker class; the form label and popup copy stay untouched", () => {
    expect(contact).toMatch(/className="lupfr-section-kicker[^"]*">Get in touch/)
    // Form field label and newsletter-popup line are not section eyebrows — leave their existing treatment alone.
    expect(contact).toContain('className="mb-3 block text-sm font-medium tracking-tight text-gold-accent"')
    expect(contact).toContain('className="mb-2 text-xs tracking-tight text-gold-accent"')
  })

  it("does not touch the partners strip (owner contract: no visible section text at all)", () => {
    expect(partnersStrip).not.toContain("lupfr-section-kicker")
  })
})

// ── brand-slash divider (owner redesign 2026-07-16) ────────────────────────────

describe("brand-slash divider", () => {
  it("defines .lupfr-brand-slash as a skewed gold accent", () => {
    expect(css).toMatch(/\.lupfr-brand-slash\s*\{[^}]*color:\s*var\(--gold\)/)
    expect(css).toMatch(/\.lupfr-brand-slash\s*\{[^}]*transform:\s*skewX\(-12deg\)/)
  })

  it("event card and detail-page titles render through BrandSlashText (e.g. SEA//SIDE)", () => {
    expect(eventsComponent).toContain('import { BrandSlashText } from "@/components/brand-slash-text"')
    expect(eventsComponent).toContain("<BrandSlashText text={event.title} />")
    const eventDetailPage = fs.readFileSync(
      path.join(rootDir, "app", "events", "[slug]", "page.tsx"),
      "utf8"
    )
    expect(eventDetailPage).toContain('import { BrandSlashText } from "@/components/brand-slash-text"')
    expect(eventDetailPage).toContain("<BrandSlashText text={event.title} />")
  })
})

// ── hero tagline corporate treatment (owner redesign 2026-07-16) ───────────────

describe("hero tagline corporate treatment", () => {
  it("desktop and mobile rotating taglines use mono/uppercase/wide-tracked type, keeping the metallic gold shine", () => {
    expect(heroDesktop).toMatch(/font-mono uppercase tracking-wide/)
    expect(heroDesktop).toContain("GoldShineText")
    expect(heroMobile).toMatch(/font-mono uppercase tracking-wide/)
    expect(heroMobile).toContain("heading-metallic-gold gold-shine-text")
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

  it("does not define the dead .hero-entertainment-text/.hero-entertainment-gradient classes or their gradient tokens (phase 22 — Entertainment line dropped its gold gradient to match the comp's plain text)", () => {
    expect(css).not.toContain(".hero-entertainment-text")
    expect(css).not.toContain(".hero-entertainment-gradient")
    expect(css).not.toContain("--entertainment-line-start")
    expect(css).not.toContain("--entertainment-line-mid")
    expect(css).not.toContain("--entertainment-line-end")
  })

  it("hero desktop references hero-title-lupfr and hero-title-entertainment classes", () => {
    expect(heroDesktop).toContain("hero-title-lupfr")
    expect(heroDesktop).toContain("hero-title-entertainment")
  })

  it("hero desktop uses hero-title-lupfr for the LUPFR wordmark wrapper", () => {
    expect(heroDesktop).toContain("hero-title-lupfr")
  })

  it("hero wordmark (LUPFR + Entertainment) uses the comp's condensed/uppercase/extrabold treatment on both desktop and mobile (phase 22, ported from the comp's bound titleFont/titleTransform/titleWeight)", () => {
    for (const source of [heroDesktop, heroShared]) {
      expect(source).toMatch(/font-condensed hero-title-lupfr font-extrabold tracking-normal/)
      expect(source).toMatch(/hero-title-entertainment font-medium uppercase tracking-normal/)
      expect(source).not.toMatch(/hero-title-lupfr[^"]*font-serif|font-serif[^"]*hero-title-lupfr/)
      expect(source).not.toContain("hero-entertainment-text")
      expect(source).not.toContain("normal-case")
    }
  })

  it(".stat-tile-surface is defined for metric card backgrounds", () => {
    expect(css).toContain(".stat-tile-surface {")
  })

  it("desktop hero renders the comp's coordinates/corner-bracket readout; mobile hero omits it (static, decorative, desktop-only)", () => {
    expect(heroShared).toContain("export function HeroCornerReadout")
    expect(heroShared).toMatch(/34\.1478°N \/\/ 118\.1445°W/)
    expect(heroDesktop).toContain("HeroCornerReadout")
    expect(heroDesktop).toContain("<HeroCornerReadout />")
    expect(heroMobile).not.toContain("HeroCornerReadout")
  })
})

// ── services card corporate numeral ─────────────────────────────────────────────

describe("services card corporate numeral", () => {
  it("services cards render the comp's faint background numeral (01, 02, ...) behind the title", () => {
    expect(servicesComponent).toContain("function serviceNumeral")
    expect(servicesComponent).toMatch(/padStart\(2, "0"\)/)
    expect(servicesComponent).toContain("serviceNumeral(index)")
  })
})

// ── artists card corporate polish ───────────────────────────────────────────────

describe("artists card corporate polish", () => {
  it("social-link chips are 26px circles with 14px icons (owner redesign 2026-07-16)", () => {
    expect(artistsComponent).toContain("size-[26px]")
    expect(artistsComponent).not.toContain("size={16}")
  })

  it("Listen label uses the mono corporate-eyebrow treatment, not the gold/semibold treatment", () => {
    expect(artistsComponent).toMatch(/font-mono text-\[9px\] tracking-\[0\.1em\] uppercase text-muted-foreground">Listen/)
    expect(artistsComponent).not.toContain('text-xs font-semibold tracking-tight text-accent">Listen')
  })
})

// ── team card corporate polish ──────────────────────────────────────────────────

describe("team card corporate polish", () => {
  it("member name uses font-condensed at a larger size (owner redesign 2026-07-16)", () => {
    expect(team.match(/font-condensed text-xl md:text-2xl font-bold tracking-tight/g)).toHaveLength(2)
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
    const expected = ["#brands", "#events", "#services", "#artists", "#about", "#team", "#contact"]
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
  it("uses the restructure comp's faded treatment for Brands photography", () => {
    expect(brandsComponent).toContain("object-cover")
    expect(brandsComponent).toMatch(/opacity-\[0\.16\]|style=\{\{ opacity: 0\.16 \}\}/)
    expect(brandsComponent).not.toContain("from-black/55 via-black/35 to-black/85")
    expect(brandsComponent).toContain("min-h-[460px]")
    expect(brandsComponent).toContain("sm:min-h-[340px]")
    expect(brandsComponent).toContain("lg:gap-8")
  })

  it("brands component owns the #brands section anchor", () => {
    expect(brandsComponent).toContain('id="brands"')
  })

  it("events component owns the #events section anchor", () => {
    expect(eventsComponent).toContain('id="events"')
  })

  it("services component owns the #services section anchor", () => {
    expect(servicesComponent).toContain('id="services"')
  })

  it("artists component owns the #artists section anchor", () => {
    expect(artistsComponent).toContain('id="artists"')
  })

  it("defers about, team, contact behind intersection observer; standalone gallery and news sections are retired", () => {
    expect(homePage).not.toContain('<DeferredHomeSection id="news"')
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

  it("keeps the archived Instagram reels block off the home Events section", () => {
    expect(eventsComponent).not.toContain('from "@/lib/data/reels"')
    expect(eventsComponent).not.toContain("ReelsBlock")
    expect(eventsComponent).not.toContain("instagramReels")
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
    expect(footer).toContain("87 N Raymond, Floor 6, Pasadena, CA")
    expect(footer).toContain("ProtectedPhone")
  })
})

// ── about structure ──────────────────────────────────────────────────────────

describe("about structure", () => {
  it("drops the founder portrait (face lives in the Team section below)", () => {
    expect(about).not.toContain("will_lupfer.webp")
  })

  it("carries the comp's restructured copy: heading, quote attribution, and the featured press card", () => {
    expect(about).toContain("Built From the Ground Up")
    expect(about).toContain("— Will Lupfer, Founder &amp; CEO")
    expect(about).toContain("getPress()[0]")
    // Old split-section copy is gone: byline/address block and value cards.
    expect(about).not.toContain("CEO &amp; Founder of LUPFR Entertainment")
    expect(about).not.toContain("87 N Raymond")
    expect(about).not.toContain("Curation")
  })

  it("rolls the five brands into the story with per-brand accent slashes", () => {
    expect(about).toContain("BrandSlashText")
    expect(about).toContain("getBrands()")
  })
})

// ── event card desktop sizing ────────────────────────────────────────────────

describe("event card desktop sizing", () => {
  it("uses the reference comp's square poster", () => {
    expect(eventsComponent).not.toContain("lg:h-[400px]")
    expect(eventsComponent).not.toContain("md:h-[340px]")
    expect(eventsComponent).toContain("relative aspect-square w-full")
  })

  it("uses the reference comp's 300px desktop card", () => {
    expect(eventsComponent).not.toContain("lg:basis-[min(640px,48%)]")
    expect(eventsComponent).not.toContain("lg:basis-[min(480px,33%)]")
    expect(eventsComponent).toContain("md:basis-[324px]")
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

// ── brand detail page layout ──────────────────────────────────────────────────

describe("brand detail page back-link row", () => {
  const brandDetailPage = fs.readFileSync(
    path.join(rootDir, "app", "brands", "[slug]", "page.tsx"),
    "utf8",
  )

  it("keeps the tag-pill kicker block-level so it cannot share a line with the All Brands back link", () => {
    // Both the back link and the pill being inline-flex put them on one text
    // line, collapsing the link's mb-8 gap (owner screenshot 2026-07-17).
    expect(brandDetailPage).toContain('className="mb-4 flex w-fit items-center rounded-xs border')
    expect(brandDetailPage).not.toContain("inline-flex w-fit items-center rounded-xs")
  })
})
