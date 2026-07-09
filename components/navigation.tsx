"use client"

import { useState, useEffect, useCallback, useRef, type MouseEvent } from "react"
import Link from "next/link"
import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScheduleCallCta } from "@/components/schedule-call-cta"
import { BLOG_PUBLIC_ACCESS_ENABLED, CONTACT_PAGE_PATH } from "@/lib/site"
import { LiquidGoldFx } from "@/components/liquid-gold-fx"
const HEADER_SCROLL_THRESHOLD_PX = 50
const SECTION_SPY_OFFSET_PX = 120
const SECTION_SPY_MIN_DELTA_PX = 96

const navLinksBase = [
  { name: "Events", href: "#events" },
  { name: "Services", href: "#services" },
  { name: "Artists", href: "#artists" },
  { name: "News", href: "#news" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "#about" },
  { name: "Team", href: "#team" },
  { name: "Contact", href: "#contact" },
] as const

// Blog is preserved in source, but hidden from navigation while public access is disabled.
const navLinks = navLinksBase.filter((link) => BLOG_PUBLIC_ACCESS_ENABLED || link.href !== "/blog")
const SECTION_IDS = navLinks.filter((l) => l.href.startsWith("#")).map((l) => l.href.slice(1))

function isPlainLeftClick(e: MouseEvent<HTMLAnchorElement>): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey
}

function scrollHashIntoView(hash: string): void {
  const el = document.getElementById(hash.slice(1))
  if (el) el.scrollIntoView({ block: "start" })
}

function pushHashAndScroll(hash: string): void {
  const before = window.location.href
  window.history.pushState(window.history.state, "", hash)
  window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: before, newURL: window.location.href }))
  // Eager sections are already mounted, so a single post-hashchange scroll lands
  // them. Deferred sections (#about/#team/#contact) run their own bounded realign
  // loop once they mount (lib/hash-scroll via DeferredHomeSection), so we no
  // longer fire blind retry timers here that would fight that convergence.
  requestAnimationFrame(() => requestAnimationFrame(() => scrollHashIntoView(hash)))
}

/**
 * Returns which home-page section the spy line (below the header) is in.
 * Using only "last section with top past offset" mis-highlights when a section is in view
 * but its top has not crossed the line yet (e.g. About in view, Gallery still "active").
 */
function pickActiveSectionId(): string {
  const y = SECTION_SPY_OFFSET_PX
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.top <= y && r.bottom > y) {
      return id
    }
  }
  let active = SECTION_IDS[0]
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= y) {
      active = id
    }
  }
  return active
}

export function Navigation() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0])
  const tickingRef = useRef(false)
  const isScrolledRef = useRef(false)
  const activeSectionRef = useRef<string>(SECTION_IDS[0])
  const lastSpyYRef = useRef(Number.NEGATIVE_INFINITY)

  /**
   * Hash links: on subpages, `/#section` so the home page scrolls to that section.
   */
  const linkHref = (href: string) => {
    if (href.startsWith("#")) return isHome ? href : `/${href}`
    return href
  }

  const isNavLinkActive = (href: string) => {
    if (href.startsWith("#")) {
      const id = href.slice(1)
      if (id === "about" && pathname === "/about") return true
      return isHome && activeSection === id
    }
    if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/")
    return false
  }
  const bookHref = CONTACT_PAGE_PATH
  const bookLabel = "Book an Event"
  const scheduleTone = isScrolled ? "on-surface" : "on-dark"

  const closeMenu = useCallback(() => setIsOpen(false), [])

  const onHomeHashClick = useCallback((e: MouseEvent<HTMLAnchorElement>, href: string, waitForMenuClose: boolean) => {
    if (!isHome || !href.startsWith("#") || !isPlainLeftClick(e)) return
    e.preventDefault()
    closeMenu()
    activeSectionRef.current = href.slice(1)
    setActiveSection(activeSectionRef.current)
    if (waitForMenuClose) {
      window.setTimeout(() => pushHashAndScroll(href), 90)
      return
    }
    pushHashAndScroll(href)
  }, [closeMenu, isHome])

  useEffect(() => {
    if (!isOpen) return
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, closeMenu])

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      requestAnimationFrame(() => {
        tickingRef.current = false
        const scrollY = window.scrollY
        const nextScrolled = scrollY > HEADER_SCROLL_THRESHOLD_PX
        if (nextScrolled !== isScrolledRef.current) {
          isScrolledRef.current = nextScrolled
          setIsScrolled(nextScrolled)
        }
        if (isHome) {
          if (Math.abs(scrollY - lastSpyYRef.current) < SECTION_SPY_MIN_DELTA_PX) return
          lastSpyYRef.current = scrollY
          const nextActiveSection = pickActiveSectionId()
          if (nextActiveSection !== activeSectionRef.current) {
            activeSectionRef.current = nextActiveSection
            setActiveSection(nextActiveSection)
          }
        }
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  return (
    <>
      <header
        data-lupfr-nav-menu-open={isOpen ? "true" : "false"}
        data-lupfr-nav-state={isScrolled || isOpen ? "settled" : "hero"}
        className="lupfr-site-header fixed top-0 left-0 right-0 z-[60] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-200 ease-snap"
      >
        <nav
          className="container relative z-10 mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1.15fr)] lg:items-center lg:justify-normal lg:gap-x-3 lg:gap-y-0 xl:gap-x-4 2xl:gap-x-5 lg:py-3"
          aria-label="Primary"
        >
          {/* Col 1: logo top-left. Center links use a separate auto column (grid) so they stay viewport-centered, not nudged by justify-end. */}
          <div className="flex min-h-[2.5rem] min-w-0 shrink-0 items-center justify-start self-center lg:min-w-0">
            <Link
              href={isHome ? "#" : "/"}
              prefetch={false}
              className="flex min-w-0 max-w-[min(100%,14rem)] shrink-0 items-center gap-2 text-2xl font-bold tracking-tighter transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.98] sm:max-w-[min(100%,16rem)] lg:max-w-none"
              aria-label="LUPFR home"
            >
              <LupfrLogoImage
                width={360}
                height={120}
                sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 220px"
                className="h-12 sm:h-16 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="hidden min-h-[2.5rem] min-w-0 items-center justify-center self-center px-0.5 sm:px-1 lg:flex">
            <div
              role="list"
              className="m-0 flex min-w-0 max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 p-0 sm:gap-x-4 md:gap-x-5 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-8"
            >
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(link.href)
                const href = linkHref(link.href)
                const linkClass = `inline-flex shrink-0 items-center text-sm font-medium leading-tight tracking-normal transition-colors duration-200 ease-snap relative group py-1 whitespace-nowrap ${isActive
                  ? "text-accent"
                  : isScrolled
                    ? "text-foreground/90 hover:text-foreground"
                    : "text-white/90 hover:text-white"
                  }`
                const underline = (
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-200 ease-snap ${isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  />
                )
                const inner = (
                  <Link
                    href={href}
                    prefetch={false}
                    className={linkClass}
                    aria-current={isActive ? "true" : undefined}
                    onClick={(e) => onHomeHashClick(e, href, false)}
                        >
                    {link.name}
                    {underline}
                  </Link>
                )
                return (
                  <div key={link.name} role="listitem" className="shrink-0">
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="hidden min-h-[2.5rem] w-full min-w-[19rem] items-center justify-end justify-self-stretch gap-x-2.5 self-center pl-2 [contain:layout] sm:pl-3 lg:flex lg:gap-x-3 xl:gap-x-3.5">
            <ThemeToggle withSound className="shrink-0" />
            <LiquidGoldFx className="shrink-0 hidden lg:inline-flex">
              <ScheduleCallCta
                tone={scheduleTone}
                size="sm"
                className="shrink-0"
              />
            </LiquidGoldFx>
            <LiquidGoldFx className="inline-flex shrink-0">
              <Link
                href={bookHref}
                prefetch={false}
                className="flex h-9 min-h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-4 !text-sm font-medium leading-tight tracking-normal transition-[color,background-color,transform] duration-150 ease-out btn-metallic-gold rounded-full hover:scale-[1.03] active:scale-[0.98]"
              >
                {bookLabel}
              </Link>
            </LiquidGoldFx>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 [contain:layout] lg:hidden">
            <ThemeToggle withSound className="shrink-0" />
            {isOpen ? (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground"
                aria-label="Close menu"
                aria-expanded="true"
              >
                <X size={24} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${isScrolled
                  ? "text-foreground"
                  : "text-white"
                  }`}
                aria-label="Open menu"
                aria-expanded="false"
              >
                <Menu size={24} aria-hidden />
              </button>
            )}
          </div>
        </nav>
      </header>

      {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[55] lg:hidden bg-background overscroll-contain touch-pan-y motion-safe:animate-[fade-up_180ms_ease-out_both]"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeMenu()
            }}
          >
            <nav
              className="flex flex-col items-center justify-start min-h-[100dvh] pt-[max(5.5rem,env(safe-area-inset-top,0px)+4rem)] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] px-4 overflow-y-auto gap-6 sm:gap-8"
            >
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(link.href)
                const href = linkHref(link.href)
                const mobileClass = `font-serif text-2xl sm:text-3xl font-bold tracking-tight transition-colors py-1 ${isActive ? "text-accent" : "text-foreground hover:text-accent"
                  }`
                return (
                  <Link
                    key={link.name}
                    href={href}
                    prefetch={false}
                    onClick={(e) => {
                      onHomeHashClick(e, href, true)
                      if (!e.defaultPrevented) closeMenu()
                    }}
                    className={mobileClass}
                    aria-current={isActive ? "true" : undefined}
                    >
                    {link.name}
                  </Link>
                )
              })}
              <ScheduleCallCta
                tone="on-surface"
                size="md"
                onClick={closeMenu}
                className="w-full max-w-[min(100%,22rem)] justify-center"
              />
              <Link
                href={bookHref}
                prefetch={false}
                onClick={closeMenu}
                className="mt-1 px-8 py-4 btn-metallic-gold font-bold tracking-normal rounded-full inline-block text-center max-w-[min(100%,22rem)]"
              >
                {bookLabel}
              </Link>
            </nav>
          </div>
        )}
    </>
  )
}
