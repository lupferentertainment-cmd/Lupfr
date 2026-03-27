"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
const MotionLink = motion.create(Link)

const HEADER_SCROLL_THRESHOLD_PX = 50
const SECTION_SPY_OFFSET_PX = 120

const navLinks = [
  { name: "Events", href: "#events" },
  { name: "Services", href: "#services" },
  { name: "Artists", href: "#artists" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const SECTION_IDS = navLinks.map((l) => l.href.slice(1))

/** Last section (in page order) whose top has crossed the spy line — stable while scrolling */
function pickActiveSectionId(): string {
  let active = SECTION_IDS[0]
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= SECTION_SPY_OFFSET_PX) {
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

  /** On event/detail pages, use full path so browser navigates to home and scrolls to section. */
  const linkHref = (hash: string) => (isHome ? hash : `/${hash}`)
  const bookHref = isHome ? "#contact" : "/#contact"
  const bookLabel = "Book an Event"

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
        setActiveSection(pickActiveSectionId())
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-[background-color,backdrop-filter,border-color,box-shadow] duration-200 ease-snap ${
          isScrolled || isOpen
            ? "bg-background/60 dark:bg-background/50 backdrop-blur-xl backdrop-saturate-150 border-b border-border/60 shadow-sm"
            : ""
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 py-2 md:py-3 flex items-center justify-between">
          <MotionLink
            href={isHome ? "#" : "/"}
            className="flex items-center gap-2 text-2xl font-bold tracking-tighter"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="LUPFR home"
          >
            <Image
              src="/logos/will_logo.png"
              alt="LUPFR"
              width={360}
              height={120}
              sizes="(max-width: 640px) 140px, (max-width: 768px) 200px, 240px"
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain"
              priority
            />
          </MotionLink>

          <div className="hidden md:flex items-center gap-8">
            <ThemeToggle withSound className="shrink-0" />
            {navLinks.map((link, i) => {
              const isActive = activeSection === link.href.slice(1)
              const href = linkHref(link.href)
              const linkClass = `text-sm uppercase tracking-widest transition-colors duration-200 ease-snap relative group py-1 ${
                isActive
                  ? "text-accent font-medium"
                  : isScrolled
                    ? "text-foreground/90 hover:text-foreground"
                    : "text-white dark:text-foreground/90 hover:text-white dark:hover:text-foreground"
              }`
              const underline = (
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-200 ease-snap ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              )
              return isHome ? (
                <MotionLink
                  key={link.name}
                  href={href}
                  className={linkClass}
                  aria-current={isActive ? "true" : undefined}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                  {underline}
                </MotionLink>
              ) : (
                <motion.a
                  key={link.name}
                  href={href}
                  className={linkClass}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                  {underline}
                </motion.a>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
          {isHome ? (
            <MotionLink
              href={bookHref}
              className="flex items-center gap-2 px-4 lg:px-5 py-2.5 btn-metallic-gold font-medium uppercase tracking-wide lg:tracking-wider transition-colors rounded-full shrink-0 min-w-0 max-w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              {bookLabel}
            </MotionLink>
          ) : (
            <motion.a
              href={bookHref}
              className="flex items-center gap-2 px-4 lg:px-5 py-2.5 btn-metallic-gold font-medium uppercase tracking-wide lg:tracking-wider transition-colors rounded-full shrink-0 min-w-0 max-w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              {bookLabel}
            </motion.a>
          )}
          </div>

          <div className="flex md:hidden items-center gap-3 shrink-0">
            <ThemeToggle withSound className="shrink-0" />
            <button
              type="button"
              onClick={() => setIsOpen((o) => !o)}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isOpen || isScrolled
                  ? "text-foreground"
                  : "text-white dark:text-foreground"
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
            className="fixed inset-0 z-[55] md:hidden bg-background overscroll-contain touch-pan-y"
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
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.slice(1)
                const href = linkHref(link.href)
                const mobileClass = `font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wider transition-colors py-1 ${
                  isActive ? "text-accent" : "text-foreground hover:text-accent"
                }`
                const enterDelay = prefersReducedMotion ? 0 : 0.06 + i * 0.05
                return isHome ? (
                  <MotionLink
                    key={link.name}
                    href={href}
                    onClick={closeMenu}
                    className={mobileClass}
                    aria-current={isActive ? "true" : undefined}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: enterDelay, duration: prefersReducedMotion ? 0.01 : 0.28 }}
                  >
                    {link.name}
                  </MotionLink>
                ) : (
                  <motion.a
                    key={link.name}
                    href={href}
                    onClick={closeMenu}
                    className={mobileClass}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: enterDelay, duration: prefersReducedMotion ? 0.01 : 0.28 }}
                  >
                    {link.name}
                  </motion.a>
                )
              })}
              {isHome ? (
                <MotionLink
                  href={bookHref}
                  onClick={closeMenu}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : 0.35,
                    duration: prefersReducedMotion ? 0.01 : 0.28,
                  }}
                  className="mt-2 px-8 py-4 btn-metallic-gold font-bold uppercase tracking-wider rounded-full inline-block text-center max-w-[min(100%,22rem)]"
                >
                  {bookLabel}
                </MotionLink>
              ) : (
                <motion.a
                  href={bookHref}
                  onClick={closeMenu}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : 0.35,
                    duration: prefersReducedMotion ? 0.01 : 0.28,
                  }}
                  className="mt-2 px-8 py-4 btn-metallic-gold font-bold uppercase tracking-wider rounded-full inline-block text-center max-w-[min(100%,22rem)]"
                >
                  {bookLabel}
                </motion.a>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
