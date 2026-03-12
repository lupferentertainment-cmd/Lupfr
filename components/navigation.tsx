"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { LINKS } from "@/lib/links"

const navLinks = [
  { name: "Events", href: "#events" },
  { name: "Services", href: "#services" },
  { name: "Artists", href: "#artists" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const SECTION_IDS = navLinks.map((l) => l.href.slice(1))

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/70 backdrop-blur-2xl border-b border-border/80 shadow-lg shadow-black/5" : ""
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 py-4 md:py-5 flex items-center justify-between">
          <motion.a
            href="#"
            className="flex items-center gap-2 text-2xl font-bold tracking-tighter"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Lupfer Entertainment home"
          >
            <Image
              src="/will_logo.png"
              alt="Lupfer Entertainment"
              width={360}
              height={120}
              className="h-14 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
              priority
            />
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => {
              const isActive = activeSection === link.href.slice(1)
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`text-sm uppercase tracking-widest transition-colors duration-200 relative group py-1 ${
                    isActive ? "text-accent font-medium" : "text-foreground/90 hover:text-foreground"
                  }`}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-200 ease-out ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </motion.a>
              )
            })}
          </div>

          <motion.a
            href={LINKS.partiful}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 btn-metallic-gold text-sm font-medium uppercase tracking-wider transition-colors rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            Book an Event
          </motion.a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
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
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-serif text-3xl font-bold uppercase tracking-wider transition-colors ${
                      isActive ? "text-accent" : "text-foreground hover:text-accent"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    {link.name}
                  </motion.a>
                )
              })}
              <motion.a
                href={LINKS.partiful}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 px-8 py-4 btn-metallic-gold text-lg font-bold uppercase tracking-wider rounded-full inline-block text-center"
              >
                Book an Event
              </motion.a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
