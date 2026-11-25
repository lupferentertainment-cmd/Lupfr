"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import { CONTACT_PAGE_PATH } from "@/lib/site"

// Round 15 (2026-11-17): About and Team moved to their own page. On the home page the first four
// tabs are in-page anchors (`#x`); off the home page they become `/#x`. About / Team always route to
// `/about` and `/about#team`.
const links = [
  ["Services", "#services"],
  ["Experiences", "#events"],
  ["Brands", "#brands"],
  ["Media", "/media"],
  ["About", "/about"],
  ["Team", "/about#team"],
] as const

type NavLink = (typeof links)[number]

function NavAnchor({ link, isHome, pathname, className, onNavigate }: { link: NavLink; isHome: boolean; pathname: string; className: string; onNavigate?: () => void }) {
  const [label, target] = link
  const isAnchor = target.startsWith("#")
  const current = (label === "About" && pathname === "/about") || (label === "Media" && pathname === "/media")
  const aria = current ? ("page" as const) : undefined
  if (isAnchor && isHome) {
    return (
      <a href={target} onClick={onNavigate} aria-current={aria} className={className}>
        {label}
      </a>
    )
  }
  return (
    <Link href={isAnchor ? `/${target}` : target} prefetch={false} onClick={onNavigate} aria-current={aria} className={className}>
      {label}
    </Link>
  )
}

export function ClaudeHomeNavigation() {
  const [open, setOpen] = useState(false)
  // usePathname() is null outside an app-router tree (tests, previews) — treat that as the home page.
  const pathname = usePathname() ?? "/"
  const isHome = pathname === "/"
  // v6 (2026-11-24): on the home page the bar is transparent over the full-screen hero and turns solid once the page
  // scrolls (or while the mobile menu is open); every other page keeps the solid bar.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!isHome) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])
  const transparent = isHome && !scrolled && !open
  return (
    <header
      data-nav-state={transparent ? "transparent" : "solid"}
      className={`fixed inset-x-0 top-0 z-[80] h-[76px] border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        transparent ? "border-transparent bg-transparent" : "border-white/10 bg-[#070605]/90 backdrop-blur-md"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-8">
        <Link href={isHome ? "#" : "/"} aria-label="LUPFR home" className="shrink-0">
          <LupfrLogoImage width={300} height={100} sizes="170px" className="h-11 w-auto object-contain" priority />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-[30px] whitespace-nowrap lg:flex">
          {links.map((link) => (
            <NavAnchor
              key={link[1]}
              link={link}
              isHome={isHome}
              pathname={pathname}
              className="font-condensed text-[15px] font-semibold uppercase tracking-[0.12em] text-[#bdb6a9] transition-colors hover:text-white aria-[current=page]:text-white"
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href={CONTACT_PAGE_PATH} className="hidden rounded-full btn-metallic-gold px-4 py-2.5 text-xs font-semibold sm:inline-flex">
            Plan Your Event
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} className="grid size-10 place-items-center text-white lg:hidden" aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="absolute left-0 right-0 top-[76px] max-h-[calc(100dvh-76px)] overflow-y-auto border-b border-white/10 bg-[#0b0a08]/98 px-6 py-6 lg:hidden">
          <nav aria-label="Site navigation" className="flex flex-col gap-5">
            {links.map((link) => (
              <NavAnchor
                key={link[1]}
                link={link}
                isHome={isHome}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
                className="font-condensed text-3xl font-bold uppercase text-[#f3efe6]"
              />
            ))}
            <Link href={CONTACT_PAGE_PATH} onClick={() => setOpen(false)} className="mt-2 inline-flex w-fit rounded-sm btn-metallic-gold px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Plan Your Event
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
