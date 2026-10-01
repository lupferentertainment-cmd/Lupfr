"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"

import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import { ThemeToggle } from "@/components/theme-toggle"
import { CONTACT_PAGE_PATH } from "@/lib/site"

const navLinks = [
  { name: "Company", href: "#brands" },
  { name: "About", href: "#about" },
  { name: "Events", href: "#events" },
  { name: "Services", href: "#services" },
  { name: "Media", href: "/media" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "#contact" },
] as const

export function Navigation() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [isOpen, setIsOpen] = useState(false)

  const hrefFor = (href: string) => (href.startsWith("#") && !isHome ? `/${href}` : href)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] border-b border-white/10 bg-[#0b0a08]/82 backdrop-blur-xl">
        <nav className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-12">
          <Link href="/" className="flex items-center" aria-label="LUPFR home">
            <LupfrLogoImage
              width={280}
              height={92}
              sizes="180px"
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={hrefFor(link.href)}
                className="group relative py-2 font-[family-name:var(--font-work-sans)] text-[13px] font-medium text-white/72 transition-colors hover:text-white"
              >
                {link.name}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle withSound className="shrink-0" />
            <Link
              href={CONTACT_PAGE_PATH}
              className="btn-metallic-gold rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Book an Event
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle withSound className="shrink-0" />
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              className="grid size-11 place-items-center text-white"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-[65] bg-[#0b0a08] px-6 pt-28 lg:hidden">
          <div className="mx-auto max-w-md border-l border-accent/35 pl-9">
            <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Company</div>
            <div className="flex flex-col">
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.name}
                  href={hrefFor(link.href)}
                  onClick={() => setIsOpen(false)}
                  className="border-b border-white/5 py-4 font-[family-name:var(--font-work-sans)] text-[16px] text-white/72 transition-colors hover:text-accent"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <Link
              href={CONTACT_PAGE_PATH}
              onClick={() => setIsOpen(false)}
              className="btn-metallic-gold mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
            >
              Book an Event
            </Link>
          </div>
        </div>
      ) : null}
    </>
  )
}
