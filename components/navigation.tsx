"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
const MotionLink = motion.create(Link)

const navLinks = [
  { name: "Events", href: "#events" },
  { name: "Services", href: "#services" },
  { name: "Artists", href: "#artists" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const SECTION_IDS = navLinks.map((l) => l.href.slice(1))

export function Navigation() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  /** On event/detail pages, use full path so browser navigates to home and scrolls to section. */
  const linkHref = (hash: string) => (isHome ? hash : `/${hash}`)
  const bookHref = isHome ? "#contact" : "/#contact"
  const bookLabel = "Book an Event"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      const headerOffset = 120
      let current: string | null = null

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          current = id
          break
        }
        if (rect.top < window.innerHeight / 2) {
          current = id
        }
      }
      setActiveSection(current ?? SECTION_IDS[0])
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-snap ${
          isScrolled
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
              className="flex items-center gap-2 px-5 py-2.5 btn-metallic-gold text-sm font-medium uppercase tracking-wider transition-colors rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              {bookLabel}
            </MotionLink>
          ) : (
            <motion.a
              href={bookHref}
              className="flex items-center gap-2 px-5 py-2.5 btn-metallic-gold text-sm font-medium uppercase tracking-wider transition-colors rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              {bookLabel}
            </motion.a>
          )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 ${isScrolled ? "text-foreground" : "text-white dark:text-foreground"}`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              <div className="absolute top-6 right-6">
                <ThemeToggle withSound />
              </div>
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.slice(1)
                const href = linkHref(link.href)
                const mobileClass = `font-serif text-3xl font-bold uppercase tracking-wider transition-colors ${
                  isActive ? "text-accent" : "text-foreground hover:text-accent"
                }`
                return isHome ? (
                  <MotionLink
                    key={link.name}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={mobileClass}
                    aria-current={isActive ? "true" : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    {link.name}
                  </MotionLink>
                ) : (
                  <motion.a
                    key={link.name}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={mobileClass}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    {link.name}
                  </motion.a>
                )
              })}
              {isHome ? (
                <MotionLink
                  href={bookHref}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 px-8 py-4 btn-metallic-gold text-lg font-bold uppercase tracking-wider rounded-full inline-block text-center"
                >
                  {bookLabel}
                </MotionLink>
              ) : (
                <motion.a
                  href={bookHref}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 px-8 py-4 btn-metallic-gold text-lg font-bold uppercase tracking-wider rounded-full inline-block text-center"
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
