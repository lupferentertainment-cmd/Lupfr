"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MotionScheduleCallCta, ScheduleCallCta } from "@/components/schedule-call-cta"
import { CONTACT_PAGE_PATH } from "@/lib/site"
const MotionLink = motion.create(Link)

const HEADER_SCROLL_THRESHOLD_PX = 50
const SECTION_SPY_OFFSET_PX = 120

const navLinks = [
  { name: "Events", href: "#events" },
  { name: "Services", href: "#services" },
  { name: "Artists", href: "#artists" },
  { name: "Gallery", href: "#gallery" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
] as const

const SECTION_IDS = navLinks.map((l) => l.href.slice(1))

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
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0])
  const tickingRef = useRef(false)

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
      if (
        id === "gallery" &&
        (pathname === "/gallery" || pathname.startsWith("/gallery/p/"))
      ) {
        return true
      }
      return isHome && activeSection === id
    }
    return false
  }
  const bookHref = CONTACT_PAGE_PATH
  const bookLabel = "Book an Event"
  const scheduleTone = isScrolled ? "on-surface" : "on-dark"

  const closeMenu = useCallback(() => setIsOpen(false), [])

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
        setIsScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD_PX)
        if (isHome) {
          setActiveSection(pickActiveSectionId())
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
        className={`fixed top-0 left-0 right-0 z-[60] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-200 ease-snap ${isScrolled || isOpen
            ? "bg-background/60 dark:bg-background/50 backdrop-blur-xl backdrop-saturate-150 border-b border-border/60 shadow-sm"
            : ""
          }`}
      >
        <nav
          className="container mx-auto flex w-full min-w-0 max-w-full items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:justify-normal lg:gap-x-0 lg:gap-y-0 lg:py-3"
          aria-label="Primary"
        >
          {/* Col 1: logo top-left. Center links use a separate auto column (grid) so they stay viewport-centered, not nudged by justify-end. */}
          <div className="flex min-h-[2.5rem] min-w-0 shrink-0 items-center justify-start self-center lg:min-w-0">
            <MotionLink
              href={isHome ? "#" : "/"}
              prefetch={!isHome}
              className="flex min-w-0 max-w-[min(100%,14rem)] shrink-0 items-center gap-2 text-2xl font-bold tracking-tighter sm:max-w-[min(100%,16rem)] lg:max-w-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="LUPFR home"
            >
              <LupfrLogoImage
                width={360}
                height={120}
                sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 220px"
                className="h-12 sm:h-16 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
                priority
              />
            </MotionLink>
          </div>

          <div className="hidden min-h-[2.5rem] min-w-0 items-center justify-center self-center px-0.5 sm:px-1 lg:flex">
            <ul className="m-0 flex min-w-0 max-w-full list-none flex-wrap items-center justify-center gap-x-3 gap-y-1 p-0 sm:gap-x-4 md:gap-x-5 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-8">
            {navLinks.map((link) => {
              const isActive = isNavLinkActive(link.href)
              const href = linkHref(link.href)
              const linkClass = `inline-flex shrink-0 items-center text-sm font-medium leading-tight tracking-normal transition-colors duration-200 ease-snap relative group py-1 whitespace-nowrap ${isActive
                  ? "text-accent"
                  : isScrolled
                    ? "text-foreground/90 hover:text-foreground"
                    : "text-foreground/90 hover:text-foreground dark:text-white dark:hover:text-white/95"
                }`
              const underline = (
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-200 ease-snap ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                />
              )
              const useNext = isHome
              const inner = useNext ? (
                <MotionLink
                  href={href}
                  prefetch
                  className={linkClass}
                  aria-current={isActive ? "true" : undefined}
                  initial={false}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                  {underline}
                </MotionLink>
              ) : (
                <motion.a
                  href={href}
                  className={linkClass}
                  initial={false}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                  {underline}
                </motion.a>
              )
              return (
                <li key={link.name} className="shrink-0">
                  {inner}
                </li>
              )
            })}
            </ul>
          </div>

          <div className="hidden min-h-[2.5rem] min-w-0 items-center justify-end justify-self-end gap-x-2 self-center [contain:layout] lg:flex xl:gap-x-3">
            <ThemeToggle withSound className="shrink-0" />
            <ScheduleCallCta
              tone={scheduleTone}
              size="sm"
              className="shrink-0 hidden lg:inline-flex"
            />
            <MotionLink
              href={bookHref}
              prefetch
              className="flex h-9 min-h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-4 !text-sm font-medium leading-tight tracking-normal transition-colors btn-metallic-gold rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              {bookLabel}
            </MotionLink>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 [contain:layout] lg:hidden">
            <ThemeToggle withSound className="shrink-0" />
            <button
              type="button"
              onClick={() => setIsOpen((o) => !o)}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${isOpen || isScrolled
                  ? "text-foreground"
                  : "text-foreground dark:text-white"
                }`}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 z-[55] lg:hidden bg-background overscroll-contain touch-pan-y"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeMenu()
            }}
          >
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.2,
                delay: prefersReducedMotion ? 0 : 0.05,
              }}
              className="flex flex-col items-center justify-start min-h-[100dvh] pt-[max(5.5rem,env(safe-area-inset-top,0px)+4rem)] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] px-4 overflow-y-auto gap-6 sm:gap-8"
            >
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(link.href)
                const href = linkHref(link.href)
                const mobileClass = `font-serif text-2xl sm:text-3xl font-bold tracking-tight transition-colors py-1 ${isActive ? "text-accent" : "text-foreground hover:text-accent"
                  }`
                const useNext = isHome
                return useNext ? (
                  <MotionLink
                    key={link.name}
                    href={href}
                    prefetch
                    onClick={closeMenu}
                    className={mobileClass}
                    aria-current={isActive ? "true" : undefined}
                    initial={false}
                  >
                    {link.name}
                  </MotionLink>
                ) : (
                  <motion.a
                    key={link.name}
                    href={href}
                    onClick={closeMenu}
                    className={mobileClass}
                    initial={false}
                  >
                    {link.name}
                  </motion.a>
                )
              })}
              <MotionScheduleCallCta
                tone="on-surface"
                size="md"
                onClick={closeMenu}
                initial={false}
                className="w-full max-w-[min(100%,22rem)] justify-center"
              />
              <MotionLink
                href={bookHref}
                prefetch
                onClick={closeMenu}
                initial={false}
                className="mt-1 px-8 py-4 btn-metallic-gold font-bold tracking-normal rounded-full inline-block text-center max-w-[min(100%,22rem)]"
              >
                {bookLabel}
              </MotionLink>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
