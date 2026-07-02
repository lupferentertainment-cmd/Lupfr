"use client"

import Image from "next/image"
import {
    type CSSProperties,
    type FormEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"

/* ============================================================
 * Styles — scoped under .ss-root so nothing leaks into the
 * rest of the site. Covers style-hover conversions, the hero
 * "kb" zoom keyframe, scroll-reveal transitions, selection
 * color, scrollbars, and prefers-reduced-motion overrides.
 * ============================================================ */
const SEASIDE_STYLES = `
.ss-root {
  position: relative;
  width: 100%;
  overflow-x: hidden;
  background: #0B0B0F;
  color: #F5F5F2;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.ss-root a { color: inherit; text-decoration: none; }
.ss-root ::selection { background: #3A6EA5; color: #F5F5F2; }
.ss-root ::-webkit-scrollbar { width: 9px; }
.ss-root ::-webkit-scrollbar-track { background: #0B0B0F; }
.ss-root ::-webkit-scrollbar-thumb { background: #22222b; }

@keyframes ss-kb {
  0% { transform: scale(1.05); }
  100% { transform: scale(1.18); }
}
.ss-root .ss-hero-bg { animation: ss-kb 26s ease-in-out infinite alternate; }

.ss-root .ss-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 1s cubic-bezier(.2,.7,.2,1), transform 1.1s cubic-bezier(.2,.7,.2,1);
}
.ss-root .ss-reveal.ss-revealed { opacity: 1; transform: none; }

.ss-root .ss-nav-link { transition: color .3s; }
.ss-root .ss-nav-link:hover { color: #F5F5F2; }

.ss-root .ss-nav-cta { transition: all .3s; }
.ss-root .ss-nav-cta:hover { background: #3A6EA5; border-color: #3A6EA5; }

.ss-root .ss-btn-solid { transition: all .3s; }
.ss-root .ss-btn-solid:hover { background: #3A6EA5; color: #F5F5F2; }

.ss-root .ss-btn-outline { transition: all .3s; }
.ss-root .ss-btn-outline:hover { border-color: #3A6EA5; color: #5B8FCB; }

.ss-root .ss-icon-btn { transition: all .3s; }
.ss-root .ss-icon-btn:hover { border-color: #3A6EA5; color: #5B8FCB; }

.ss-root .ss-modal-close { transition: all .3s; }
.ss-root .ss-modal-close:hover { border-color: #3A6EA5; color: #5B8FCB; }

.ss-root .ss-link { transition: all .3s; }
.ss-root .ss-link:hover { color: #5B8FCB; border-color: #3A6EA5; }

.ss-root .ss-link-color { transition: color .3s; }
.ss-root .ss-link-color:hover { color: #5B8FCB; }

.ss-root .ss-partner-card { transition: border-color .4s; }
.ss-root .ss-partner-card:hover { border-color: #3A6EA5; }

.ss-root .ss-input { transition: border-color .3s; }
.ss-root .ss-input:focus { border-color: #3A6EA5; }

@media (prefers-reduced-motion: reduce) {
  .ss-root .ss-hero-bg { animation: none; }
  .ss-root .ss-reveal { transition: opacity .4s ease; transform: none; }
}
`

/* ============================================================
 * Types
 * ============================================================ */
type ArtistKey = "hlwa" | "soch" | "auguste" | "nick"
type ModalIntent = "access" | "partner"

interface ArtistLink {
    label: string
    url: string
}

interface Artist {
    key: ArtistKey
    name: string
    role: string
    genre: string
    image: string | null
    location: string
    bullets: string[]
    links: ArtistLink[]
}

interface EditionSpec {
    key: string
    value: string
    support?: string
    image: string
}

interface EditionTier {
    name: string
    price: string
}

interface Edition {
    num: string
    status: string
    date: string
    heroImage: string
    headline: string
    specs: EditionSpec[]
    tiers: EditionTier[]
    note?: string
    lineup: ArtistKey[]
    past: boolean
}

interface TeamMember {
    name: string
    role: string
    bio: string
    delay: number
}

interface SeasideFormState {
    name: string
    email: string
    three: string
    four: string
}

/* ============================================================
 * Data
 * ============================================================ */
const NAV_LINKS = [
    { href: "#concept", label: "Concept" },
    { href: "#edition", label: "Editions" },
    { href: "#lineup", label: "Lineup" },
    { href: "#partners", label: "Partners" },
    { href: "#about", label: "About" },
]

const ARTISTS: Record<ArtistKey, Artist> = {
    hlwa: {
        key: "hlwa",
        name: "HLWA",
        role: "Headliner · DJ Set",
        genre: "",
        image: "/seaside/dj-bridge.webp",
        location: "",
        bullets: [],
        links: [{ label: "Spotify", url: "https://open.spotify.com/artist/1uFstDfzHjdGuzOrnrzOTy" }],
    },
    soch: {
        key: "soch",
        name: "Soch",
        role: "DJ Set",
        genre: "",
        image: null,
        location: "",
        bullets: [],
        links: [],
    },
    auguste: {
        key: "auguste",
        name: "Auguste",
        role: "Headliner · DJ Set",
        genre: "Afro-House",
        image: null,
        location: "French / Martiniquan · ~500K monthly listeners",
        bullets: [
            "Top-100 Beatport Afro House Artist · releases via Empire, Armada & Insomniac",
            "Backed by Diplo & Black Coffee · Tomorrowland, Ultra, Hï Ibiza, Cercle",
            "Known for his remix of Asake’s \"Basquiat\"",
        ],
        links: [
            { label: "Spotify", url: "https://open.spotify.com/artist/AUGUSTE" },
            { label: "@auguste_ofc", url: "https://instagram.com/auguste_ofc" },
        ],
    },
    nick: {
        key: "nick",
        name: "Nick Rosen",
        role: "Opener · DJ Set",
        genre: "Open Format",
        image: null,
        location: "Orange County, CA · Strong local pull",
        bullets: [
            "Opens the night ahead of the headline set",
            "Warms the deck as the sun drops over the Pacific",
        ],
        links: [{ label: "@nickrosen", url: "https://instagram.com/nickrosen" }],
    },
}

const EDITIONS: Edition[] = [
    {
        num: "001",
        status: "Past · Open to Public",
        date: "Recap · 2026",
        heroImage: "/seaside/dj-bridge.webp",
        headline: "HLWA + Soch",
        specs: [
            { key: "Headliner", value: "HLWA", support: "Soch", image: "/seaside/dj-bridge.webp" },
            { key: "Location", value: "San Francisco, CA", image: "/seaside/keys-skyline.webp" },
            { key: "Vessel", value: "Empress Sausalito", image: "/seaside/hero-yacht.webp" },
            { key: "Access", value: "Open to the Public", image: "/seaside/golden-crowd.webp" },
            { key: "Dress Code", value: "All-White Linen", image: "/seaside/squad.webp" },
        ],
        tiers: [],
        lineup: ["hlwa", "soch"],
        past: true,
    },
    {
        num: "002",
        status: "🔒 Private · Invite Only",
        date: "Saturday · August 1, 2026",
        heroImage: "/seaside/golden-crowd.webp",
        headline: "Auguste + Nick Rosen",
        specs: [
            { key: "Headliner", value: "Auguste", support: "Nick Rosen", image: "/seaside/golden-crowd.webp" },
            { key: "Location", value: "Long Beach, CA", image: "/seaside/keys-skyline.webp" },
            { key: "Vessel", value: "Dream On Yacht · City Experiences", image: "/seaside/deck-packed.webp" },
            { key: "Access", value: "Private · Invite Only", image: "/seaside/glow-silhouette.webp" },
            { key: "Dress Code", value: "All-White Linen", image: "/seaside/sun-mingle.webp" },
        ],
        tiers: [
            { name: "Early Bird", price: "$55" },
            { name: "GA I", price: "$75" },
            { name: "GA II", price: "$85–90" },
        ],
        note: "165 paid · 35 comped · 200 capacity. Pricing shown for transparency — access requires an approved POSH passcode.",
        lineup: ["auguste", "nick"],
        past: false,
    },
]

const TEAM_MEMBERS: TeamMember[] = [
    {
        name: "Will Lupfer",
        role: "Founder & CEO",
        bio: "Leads sponsorship, brand strategy, and the vision behind LUPFR's flagship franchises — from boiler-room sets to yacht takeovers.",
        delay: 0,
    },
    {
        name: "Zac Brosky",
        role: "Event Manager, LA",
        bio: "Runs production, contractor management, and artist relations — the key lead building out LA with a focus on SEA // SIDE.",
        delay: 80,
    },
    {
        name: "Kylie Cortez",
        role: "Legal & Events",
        bio: "USC Gould School of Law. Supports contracts, venue operations, and event legal work.",
        delay: 160,
    },
    {
        name: "Taylor Ford",
        role: "Event Associate",
        bio: "Bio coming soon.",
        delay: 240,
    },
]

const LUPFR_FAMILY = [
    { name: "SEA // SIDE", note: "Offshore · Yachts", highlight: true },
    { name: "Boiler", note: "Intimate boiler-room sets", highlight: false },
    { name: "SoundCheck", note: "The people behind the music", highlight: false },
    { name: "Rooftop Grooves", note: "Rooftop series", highlight: false },
]

const EMPTY_FORM: SeasideFormState = { name: "", email: "", three: "", four: "" }

/* ============================================================
 * Small building blocks
 * ============================================================ */
function ArtistPlaceholder({ name }: { name: string }) {
    const stripes: ReactNode[] = []
    for (let x = -520; x < 420; x += 26) {
        stripes.push(<line key={x} x1={x} y1={0} x2={x + 500} y2={500} />)
    }
    return (
        <svg
            viewBox="0 0 400 500"
            role="img"
            aria-label={`${name} — photo coming soon`}
            style={{ width: "100%", height: "100%", display: "block" }}
        >
            <rect width={400} height={500} fill="#14141a" />
            <g stroke="#20212b" strokeWidth={9}>
                {stripes}
            </g>
            <text x={200} y={248} fill="#5B8FCB" fontFamily="monospace" fontSize={16} textAnchor="middle">
                {name}
            </text>
            <text x={200} y={272} fill="#6F6F78" fontFamily="monospace" fontSize={11} letterSpacing={2} textAnchor="middle">
                PHOTO
            </text>
        </svg>
    )
}

interface RevealProps {
    children: ReactNode
    delay?: number
    className?: string
    style?: CSSProperties
}

function Reveal({ children, delay = 0, className, style }: RevealProps) {
    const [visible, setVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (visible) return
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true)
            return
        }
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setVisible(true)
                        io.unobserve(entry.target)
                    }
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [visible])

    return (
        <div
            ref={ref}
            className={`ss-reveal${visible ? " ss-revealed" : ""}${className ? ` ${className}` : ""}`}
            style={{ transitionDelay: visible ? `${delay}ms` : "0ms", ...style }}
        >
            {children}
        </div>
    )
}

/* ============================================================
 * Nav
 * ============================================================ */
function SeasideNav({ onRequestAccess }: { onRequestAccess: () => void }) {
    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                padding: "16px clamp(20px,5vw,64px)",
                background: "rgba(11,11,15,0.6)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderBottom: "1px solid rgba(245,245,242,0.08)",
            }}
        >
            <a href="#top" style={{ fontWeight: 200, fontSize: 18, letterSpacing: "0.32em", whiteSpace: "nowrap" }}>
                SEA // SIDE
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,1.9vw,32px)", flexWrap: "wrap", justifyContent: "center" }}>
                {NAV_LINKS.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        className="ss-nav-link"
                        style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#B9B9B6" }}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
            <button
                type="button"
                onClick={onRequestAccess}
                className="ss-nav-cta"
                style={{
                    border: "1px solid rgba(245,245,242,0.5)",
                    background: "transparent",
                    color: "#F5F5F2",
                    padding: "11px 20px",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                }}
            >
                Request Access
            </button>
        </nav>
    )
}

/* ============================================================
 * Hero
 * ============================================================ */
function SeasideHero({ onRequestAccess }: { onRequestAccess: () => void }) {
    return (
        <header
            id="top"
            style={{
                position: "relative",
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
            }}
        >
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
                <div
                    className="ss-hero-bg"
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "url('/seaside/glow-silhouette.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center 42%",
                    }}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    background:
                        "linear-gradient(180deg,rgba(11,11,15,0.66) 0%,rgba(11,11,15,0.25) 34%,rgba(11,11,15,0.42) 60%,rgba(11,11,15,0.95) 100%)",
                }}
            />

            <div
                style={{
                    position: "relative",
                    zIndex: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "clamp(84px,12vh,110px) clamp(20px,5vw,64px) 0",
                }}
            >
                <div style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#5B8FCB", fontWeight: 600 }}>
                    An Offshore Music Experience
                </div>
                <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(245,245,242,0.6)" }}>
                    PRESENTED BY LUPFR ENTERTAINMENT
                </div>
            </div>

            <div style={{ position: "relative", zIndex: 3, padding: "0 clamp(20px,5vw,64px) clamp(48px,7vh,84px)", maxWidth: 1500, width: "100%", margin: "0 auto" }}>
                <h1
                    style={{
                        margin: 0,
                        fontWeight: 200,
                        fontSize: "clamp(52px,13.5vw,210px)",
                        lineHeight: 0.9,
                        letterSpacing: "0.1em",
                        whiteSpace: "nowrap",
                    }}
                >
                    SEA <span style={{ fontWeight: 300 }}>{"//"}</span> SIDE
                </h1>
                <div style={{ width: 130, height: 4, background: "#3A6EA5", margin: "clamp(20px,3vh,34px) 0 clamp(18px,2.6vh,28px)" }} />
                <p style={{ margin: 0, fontSize: "clamp(12px,1.9vw,22px)", lineHeight: 1.5, color: "#E7E7E2", fontWeight: 300, whiteSpace: "nowrap" }}>
                    Private Yachts. Curated Artists. Premier Production. Unseen Vibes.
                </p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: "clamp(26px,4vh,40px)" }}>
                    <button
                        type="button"
                        onClick={onRequestAccess}
                        className="ss-btn-solid"
                        style={{
                            border: "none",
                            background: "#F5F5F2",
                            color: "#0B0B0F",
                            padding: "16px 34px",
                            fontSize: 12,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        Request Access
                    </button>
                    <a
                        href="#concept"
                        className="ss-btn-outline"
                        style={{
                            border: "1px solid rgba(245,245,242,0.5)",
                            color: "#F5F5F2",
                            padding: "16px 34px",
                            fontSize: 12,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            backdropFilter: "blur(3px)",
                        }}
                    >
                        EXPLORE EDITIONS
                    </a>
                </div>
            </div>
        </header>
    )
}

/* ============================================================
 * Concept
 * ============================================================ */
const CONCEPT_CARDS = [
    { title: "Offshore Venue", body: "Open water, turned into a floating stage." },
    { title: "Golden Hour", body: "A sunset cruise, timed to the light." },
    { title: "Music-First", body: "Curated DJ sets. Never a club night." },
]

function SeasideConcept() {
    return (
        <section
            id="concept"
            style={{
                scrollMarginTop: 70,
                position: "relative",
                overflow: "hidden",
                padding: "clamp(90px,15vh,180px) clamp(20px,5vw,64px)",
                background: "#0B0B0F",
                minHeight: "clamp(440px,58vh,660px)",
                display: "flex",
                alignItems: "center",
            }}
        >
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(52%,820px)", zIndex: 0, overflow: "hidden" }}>
                <Image
                    src="/seaside/keys-skyline.webp"
                    alt="Live music on the water at golden hour"
                    fill
                    sizes="(max-width: 900px) 100vw, 820px"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: "linear-gradient(90deg,#0B0B0F 0%,rgba(11,11,15,0.74) 24%,rgba(11,11,15,0.18) 60%,rgba(11,11,15,0) 100%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background: "linear-gradient(180deg,#0B0B0F 0%,rgba(11,11,15,0) 20%,rgba(11,11,15,0) 80%,#0B0B0F 100%)",
                    }}
                />
            </div>
            <div style={{ position: "relative", zIndex: 2, maxWidth: 1500, margin: "0 auto", width: "100%" }}>
                <Reveal style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "clamp(30px,5vh,50px)" }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", color: "#3A6EA5", fontWeight: 600 }}>(01)</span>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A93" }}>THE CONCEPT</span>
                </Reveal>
                <Reveal
                    style={{
                        maxWidth: "18ch",
                        fontFamily: "var(--font-anton), sans-serif",
                        fontWeight: 400,
                        fontSize: "clamp(38px,6.5vw,104px)",
                        lineHeight: 0.98,
                        letterSpacing: "0.01em",
                        textTransform: "uppercase",
                    }}
                >
                    <span style={{ color: "#5B8FCB" }}>SEA // SIDE</span> takes the music experience offshore.
                </Reveal>
                <div style={{ width: 130, height: 4, background: "#3A6EA5", margin: "clamp(30px,5vh,46px) 0 clamp(24px,4vh,32px)" }} />
                <p style={{ margin: 0, maxWidth: "40ch", fontSize: "clamp(16px,1.5vw,22px)", lineHeight: 1.6, color: "#FFFFFF", fontWeight: 300 }}>
                    We decided land wasn&apos;t good enough. <br />
                    So we took the music <b>SEA//SIDE</b>.
                </p>
                <Reveal
                    style={{
                        maxWidth: 620,
                        marginTop: "clamp(30px,4.5vh,48px)",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                        gap: 12,
                    }}
                >
                    <>
                        {CONCEPT_CARDS.map((card) => (
                            <div
                                key={card.title}
                                style={{
                                    border: "1px solid rgba(245,245,242,0.14)",
                                    background: "rgba(16,16,21,0.6)",
                                    backdropFilter: "blur(4px)",
                                    WebkitBackdropFilter: "blur(4px)",
                                    padding: "18px 20px",
                                }}
                            >
                                <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5B8FCB", marginBottom: 9 }}>
                                    {card.title}
                                </div>
                                <div style={{ fontSize: 13, lineHeight: 1.55, color: "#B9B9B6" }}>{card.body}</div>
                            </div>
                        ))}
                    </>
                </Reveal>
            </div>
        </section>
    )
}

/* ============================================================
 * Editions carousel
 * ============================================================ */
interface EditionSpecRowProps {
    spec: EditionSpec
    active: boolean
    onSelect: () => void
}

function EditionHeadlinerRow({ spec, active, onSelect }: EditionSpecRowProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 5,
                width: "100%",
                textAlign: "left",
                padding: "16px 14px",
                background: active ? "rgba(58,110,165,0.16)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(245,245,242,0.09)",
                borderLeft: `2px solid ${active ? "#3A6EA5" : "transparent"}`,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .3s",
            }}
        >
            <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7FB0E6", fontWeight: 600 }}>
                Headliner
            </span>
            <span
                style={{
                    fontFamily: "var(--font-anton), sans-serif",
                    fontSize: "clamp(28px,3.6vw,46px)",
                    textTransform: "uppercase",
                    lineHeight: 1,
                    color: "#5B8FCB",
                    letterSpacing: "0.01em",
                }}
            >
                {spec.value}
            </span>
            {spec.support ? <span style={{ fontSize: 12, letterSpacing: "0.04em", color: "#C2C2BE" }}>with {spec.support}</span> : null}
        </button>
    )
}

function EditionSpecRow({ spec, active, onSelect }: EditionSpecRowProps) {
    return (
        <button
            type="button"
            onClick={onSelect}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 18,
                width: "100%",
                textAlign: "left",
                padding: "15px 14px",
                background: active ? "rgba(58,110,165,0.20)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(245,245,242,0.09)",
                borderLeft: `2px solid ${active ? "#3A6EA5" : "transparent"}`,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .3s",
            }}
        >
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, color: active ? "#7FB0E6" : "#D6D6D2" }}>
                {spec.key}
            </span>
            <span style={{ fontSize: 15, fontWeight: 400, textAlign: "right", color: active ? "#7FB0E6" : "#F2F2EF" }}>{spec.value}</span>
        </button>
    )
}

interface EditionsProps {
    edition: Edition
    editionIndex: number
    editionCount: number
    activeSpecIndex: number
    activeImage: string
    onPrev: () => void
    onNext: () => void
    onSelectSpec: (index: number) => void
    onSelectDot: (index: number) => void
    onRequestAccess: () => void
}

function SeasideEditions(props: EditionsProps) {
    const { edition, editionIndex, editionCount, activeSpecIndex, activeImage, onPrev, onNext, onSelectSpec, onSelectDot, onRequestAccess } = props
    const indexLabel = `${String(editionIndex + 1).padStart(2, "0")} / ${String(editionCount).padStart(2, "0")}`
    const restSpecs = edition.specs.slice(1)
    const isUpcoming = !edition.past

    return (
        <section id="edition" style={{ scrollMarginTop: 70, padding: "clamp(80px,12vh,150px) clamp(20px,5vw,64px)", background: "#0B0B0F" }}>
            <div style={{ maxWidth: 1500, margin: "0 auto" }}>
                <Reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(30px,4.5vh,48px)" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                            <span style={{ fontSize: 12, letterSpacing: "0.22em", color: "#3A6EA5", fontWeight: 600 }}>(02)</span>
                            <span style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A93" }}>The slate</span>
                        </div>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: "var(--font-anton), sans-serif",
                                fontWeight: 400,
                                fontSize: "clamp(44px,8vw,120px)",
                                lineHeight: 0.9,
                                letterSpacing: "0.01em",
                                textTransform: "uppercase",
                            }}
                        >
                            Editions
                        </h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "#8A8A93" }}>{indexLabel}</div>
                        <button
                            type="button"
                            onClick={onPrev}
                            aria-label="Previous edition"
                            className="ss-icon-btn"
                            style={{ width: 44, height: 44, border: "1px solid rgba(245,245,242,0.3)", background: "transparent", color: "#F5F5F2", cursor: "pointer", fontSize: 18, fontFamily: "inherit" }}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            aria-label="Next edition"
                            className="ss-icon-btn"
                            style={{ width: 44, height: 44, border: "1px solid rgba(245,245,242,0.3)", background: "transparent", color: "#F5F5F2", cursor: "pointer", fontSize: 18, fontFamily: "inherit" }}
                        >
                            ›
                        </button>
                    </div>
                </Reveal>

                <Reveal>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(24px,3.5vw,52px)", alignItems: "stretch" }}>
                        <div style={{ position: "relative", minHeight: "clamp(600px,62vh,680px)", overflow: "hidden", border: "1px solid rgba(245,245,242,0.1)" }}>
                            <Image
                                key={activeImage}
                                src={activeImage}
                                alt={`${edition.headline} — ${edition.num}`}
                                fill
                                sizes="(max-width: 900px) 100vw, 50vw"
                                style={{ objectFit: "cover" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(11,11,15,0.1) 0%,rgba(11,11,15,0.85) 100%)" }} />
                            <div
                                style={{
                                    position: "absolute",
                                    top: 18,
                                    left: 18,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 9,
                                    padding: "9px 15px",
                                    border: "1px solid rgba(58,110,165,0.55)",
                                    background: "rgba(11,11,15,0.5)",
                                    backdropFilter: "blur(5px)",
                                    fontSize: 11,
                                    letterSpacing: "0.16em",
                                    textTransform: "uppercase",
                                    color: "#5B8FCB",
                                }}
                            >
                                {edition.status}
                            </div>
                            <div style={{ position: "absolute", left: 22, bottom: 20, right: 22 }}>
                                <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5B8FCB", marginBottom: 8 }}>{edition.date}</div>
                                <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(22px,2.8vw,38px)", textTransform: "uppercase", lineHeight: 1 }}>
                                    {edition.headline}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", minHeight: "clamp(600px,62vh,680px)" }}>
                            <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(30px,4vw,58px)", textTransform: "uppercase", lineHeight: 0.95, marginBottom: 22 }}>
                                {edition.num}
                            </div>
                            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A8A93", marginBottom: 6 }}>Tap to preview →</div>
                            <div style={{ borderTop: "1px solid rgba(245,245,242,0.16)" }}>
                                <EditionHeadlinerRow spec={edition.specs[0]} active={activeSpecIndex === 0} onSelect={() => onSelectSpec(0)} />
                                {restSpecs.map((spec, i) => (
                                    <EditionSpecRow key={spec.key} spec={spec} active={activeSpecIndex === i + 1} onSelect={() => onSelectSpec(i + 1)} />
                                ))}
                            </div>
                            {edition.tiers.length > 0 ? (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 24 }}>
                                        {edition.tiers.map((tier) => (
                                            <div key={tier.name} style={{ border: "1px solid rgba(245,245,242,0.12)", background: "#16161D", padding: "15px 13px" }}>
                                                <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8A8A93" }}>{tier.name}</div>
                                                <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(22px,2.5vw,32px)", marginTop: 6 }}>{tier.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 12, fontSize: 12, color: "#6F6F78" }}>{edition.note}</div>
                                </>
                            ) : null}
                            {isUpcoming ? (
                                <button
                                    type="button"
                                    onClick={onRequestAccess}
                                    className="ss-btn-solid"
                                    style={{
                                        marginTop: 24,
                                        alignSelf: "flex-start",
                                        border: "none",
                                        background: "#F5F5F2",
                                        color: "#0B0B0F",
                                        padding: "16px 32px",
                                        fontSize: 12,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Request the Passcode →
                                </button>
                            ) : (
                                <div
                                    style={{
                                        marginTop: 24,
                                        alignSelf: "flex-start",
                                        fontSize: 11,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        color: "#C2C2BE",
                                        border: "1px solid rgba(58,110,165,0.35)",
                                        background: "rgba(58,110,165,0.08)",
                                        padding: "15px 26px",
                                    }}
                                >
                                    ◍ This edition has sailed · Public
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 26, justifyContent: "center" }}>
                        {Array.from({ length: editionCount }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onSelectDot(i)}
                                aria-label={`Go to edition ${i + 1}`}
                                style={{
                                    width: i === editionIndex ? 30 : 10,
                                    height: 10,
                                    borderRadius: 20,
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                    background: i === editionIndex ? "#3A6EA5" : "rgba(245,245,242,0.28)",
                                    transition: "all .3s",
                                }}
                            />
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

/* ============================================================
 * Featured artists (lineup)
 * ============================================================ */
interface RosterGroupProps {
    edition: Edition
    activeKey: ArtistKey
    onSelectArtist: (key: ArtistKey) => void
}

function RosterGroup({ edition, activeKey, onSelectArtist }: RosterGroupProps) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
                paddingBottom: 22,
                borderBottom: "1px solid rgba(245,245,242,0.09)",
                marginBottom: 26,
            }}
        >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 30px", alignItems: "flex-end" }}>
                {edition.lineup.length > 0 ? (
                    edition.lineup.map((key) => {
                        const artist = ARTISTS[key]
                        const isHeadliner = /headliner/i.test(artist.role)
                        const active = key === activeKey
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onSelectArtist(key)}
                                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}
                            >
                                <span
                                    style={{
                                        fontFamily: "var(--font-anton), sans-serif",
                                        textTransform: "uppercase",
                                        fontSize: "clamp(24px,3.2vw,46px)",
                                        lineHeight: 1,
                                        color: isHeadliner ? "#5B8FCB" : "#F5F5F2",
                                        borderBottom: active ? "2px solid #5B8FCB" : "2px solid transparent",
                                        paddingBottom: 3,
                                        transition: "all .3s",
                                    }}
                                >
                                    {artist.name}
                                </span>
                                <span style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8A8A93" }}>
                                    {artist.genre}
                                </span>
                            </button>
                        )
                    })
                ) : (
                    <span style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(22px,3vw,40px)", textTransform: "uppercase", color: "#4E4E57", lineHeight: 1 }}>
                        Lineup TBA
                    </span>
                )}
            </div>
            <span
                style={{
                    fontFamily: "var(--font-anton), sans-serif",
                    fontSize: "clamp(30px,4vw,58px)",
                    lineHeight: 0.8,
                    color: "transparent",
                    WebkitTextStroke: "1.5px rgba(91,143,203,0.7)",
                    letterSpacing: "0.02em",
                    flex: "none",
                }}
            >
                {edition.num}
            </span>
        </div>
    )
}

interface LineupProps {
    activeArtist: Artist
    onSelectArtist: (key: ArtistKey) => void
}

function SeasideLineup({ activeArtist, onSelectArtist }: LineupProps) {
    return (
        <section id="lineup" style={{ scrollMarginTop: 70, padding: "clamp(60px,9vh,110px) clamp(20px,5vw,64px)", background: "#0E0E13", borderTop: "1px solid rgba(245,245,242,0.07)" }}>
            <div style={{ maxWidth: 1500, margin: "0 auto" }}>
                <Reveal style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", color: "#3A6EA5", fontWeight: 600 }}>(03)</span>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A93" }}>Talent</span>
                </Reveal>
                <Reveal
                    style={{
                        marginBottom: "clamp(24px,3.5vh,36px)",
                        fontFamily: "var(--font-anton), sans-serif",
                        fontWeight: 400,
                        fontSize: "clamp(32px,5vw,68px)",
                        lineHeight: 0.96,
                        letterSpacing: "0.01em",
                        textTransform: "uppercase",
                    }}
                >
                    Featured Artists
                </Reveal>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px,4vw,56px)", alignItems: "flex-start" }}>
                    <Reveal style={{ flex: "0 1 clamp(210px,25vw,280px)", minWidth: 200 }}>
                        <div
                            style={{
                                position: "relative",
                                aspectRatio: "4 / 5",
                                overflow: "hidden",
                                border: "1px solid rgba(58,110,165,0.5)",
                                borderRadius: "9999px 9999px 16px 16px",
                                background: "#16161D",
                            }}
                        >
                            {activeArtist.image ? (
                                <Image
                                    key={activeArtist.key}
                                    src={activeArtist.image}
                                    alt={activeArtist.name}
                                    fill
                                    sizes="(max-width: 640px) 45vw, 280px"
                                    style={{ objectFit: "cover", objectPosition: "center 30%" }}
                                />
                            ) : (
                                <ArtistPlaceholder name={activeArtist.name} />
                            )}
                            <div style={{ position: "absolute", bottom: 14, left: 14, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", padding: "6px 11px", background: "#3A6EA5", color: "#F5F5F2" }}>
                                {activeArtist.role}
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 18 }}>
                            <h3 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(24px,2.8vw,36px)", textTransform: "uppercase", lineHeight: 1 }}>
                                {activeArtist.name}
                            </h3>
                            <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5B8FCB", whiteSpace: "nowrap" }}>{activeArtist.genre}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#8A8A93", marginTop: 7 }}>{activeArtist.location}</div>
                        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 9 }}>
                            {activeArtist.bullets.map((bullet) => (
                                <li key={bullet} style={{ fontSize: 13, color: "#C2C2BE", lineHeight: 1.45, display: "flex", gap: 9, alignItems: "flex-start" }}>
                                    <span style={{ flex: "none", width: 5, height: 5, background: "#3A6EA5", marginTop: 7 }} />
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
                            {activeArtist.links.map((link) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ss-link"
                                    style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: "1px solid rgba(245,245,242,0.3)", paddingBottom: 3 }}
                                >
                                    {link.label} ↗
                                </a>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal delay={120} style={{ flex: "1 1 360px" }}>
                        <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8A8A93", paddingBottom: 20, borderBottom: "1px solid rgba(245,245,242,0.1)", marginBottom: 28 }}>
                            Selected Roster · By Edition
                        </div>
                        {EDITIONS.map((edition) => (
                            <RosterGroup key={edition.num} edition={edition} activeKey={activeArtist.key} onSelectArtist={onSelectArtist} />
                        ))}
                        <p style={{ margin: "30px 0 0", fontSize: 13, lineHeight: 1.7, color: "#6F6F78", maxWidth: "54ch" }}>
                            Headliners shown in blue. Rising acts booked directly — plus agency partner Forge Ahead Talent. Tap a name to see the profile.
                        </p>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

/* ============================================================
 * Partners + Team
 * ============================================================ */
function SeasidePartners() {
    return (
        <section id="partners" style={{ scrollMarginTop: 70, padding: "clamp(80px,12vh,150px) clamp(20px,5vw,64px)", background: "#0E0E13", borderTop: "1px solid rgba(245,245,242,0.07)" }}>
            <div style={{ maxWidth: 1500, margin: "0 auto" }}>
                <Reveal style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", color: "#3A6EA5", fontWeight: 600 }}>(04)</span>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A93" }}>The company we keep</span>
                </Reveal>
                <Reveal
                    style={{
                        marginBottom: "clamp(34px,5vh,52px)",
                        fontFamily: "var(--font-anton), sans-serif",
                        fontWeight: 400,
                        fontSize: "clamp(40px,7vw,100px)",
                        lineHeight: 0.96,
                        letterSpacing: "0.01em",
                        textTransform: "uppercase",
                    }}
                >
                    Partners
                </Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
                    <Reveal
                        className="ss-partner-card"
                        style={{ border: "1px solid rgba(58,110,165,0.4)", background: "#16161D", padding: "clamp(26px,3vw,38px)", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    >
                        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5B8FCB" }}>Operator</div>
                        <div>
                            <Image src="/seaside/lupfr-le.webp" alt="LUPFR Entertainment" width={56} height={56} style={{ display: "block", marginBottom: 16 }} />
                            <h3 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(26px,3vw,40px)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                LUPFR Entertainment
                            </h3>
                            <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.65, color: "#8A8A93" }}>Dream On Yacht · Hornblower · Long Beach</p>
                        </div>
                    </Reveal>
                    <Reveal
                        delay={80}
                        className="ss-partner-card"
                        style={{ border: "1px solid rgba(245,245,242,0.1)", background: "#16161D", padding: "clamp(26px,3vw,38px)", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    >
                        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5B8FCB" }}>Title Sponsor</div>
                        <div>
                            <Image src="/seaside/vybes-logo.webp" alt="Vybes" width={62} height={42} style={{ display: "block", marginBottom: 16 }} />
                            <h3 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(30px,3.4vw,46px)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                Vybes
                            </h3>
                            <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.65, color: "#8A8A93" }}>Influencer network + social amplification · 12 comp tickets</p>
                            <a
                                href="https://www.vybes.co/"
                                target="_blank"
                                rel="noreferrer"
                                className="ss-link-color"
                                style={{ display: "inline-block", marginTop: 14, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: "1px solid rgba(245,245,242,0.3)", paddingBottom: 3 }}
                            >
                                vybes.co ↗
                            </a>
                        </div>
                    </Reveal>
                    <Reveal
                        delay={160}
                        className="ss-partner-card"
                        style={{ border: "1px solid rgba(245,245,242,0.1)", background: "#16161D", padding: "clamp(26px,3vw,38px)", minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    >
                        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5B8FCB" }}>Media Partner</div>
                        <div>
                            <h3 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(24px,2.6vw,34px)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                Link Studios
                            </h3>
                            <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.65, color: "#8A8A93" }}>Creator-led content &amp; recap · delivered ≤4 days after the sail</p>
                        </div>
                    </Reveal>
                </div>

                <Reveal style={{ display: "flex", alignItems: "center", gap: 14, margin: "clamp(56px,9vh,96px) 0 12px" }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", color: "#3A6EA5", fontWeight: 600 }}>(05)</span>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A93" }}>The people</span>
                </Reveal>
                <Reveal
                    style={{
                        marginBottom: "clamp(28px,4vh,42px)",
                        fontFamily: "var(--font-anton), sans-serif",
                        fontWeight: 400,
                        fontSize: "clamp(34px,5.5vw,74px)",
                        lineHeight: 0.96,
                        letterSpacing: "0.01em",
                        textTransform: "uppercase",
                    }}
                >
                    The Team
                </Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
                    {TEAM_MEMBERS.map((member) => (
                        <Reveal key={member.name} delay={member.delay} style={{ borderTop: "1px solid rgba(58,110,165,0.5)", paddingTop: 20 }}>
                            <h3 style={{ margin: 0, fontWeight: 500, fontSize: 19, letterSpacing: "0.01em" }}>{member.name}</h3>
                            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5B8FCB", marginTop: 7 }}>{member.role}</div>
                            <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.7, color: "#8A8A93" }}>{member.bio}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ============================================================
 * About LUPFR
 * ============================================================ */
function SeasideAbout() {
    return (
        <section id="about" style={{ scrollMarginTop: 70, padding: "clamp(80px,12vh,150px) clamp(20px,5vw,64px)", background: "#0B0B0F", borderTop: "1px solid rgba(245,245,242,0.07)" }}>
            <div style={{ maxWidth: 1500, margin: "0 auto" }}>
                <Reveal style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "clamp(30px,4.5vh,48px)" }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", color: "#3A6EA5", fontWeight: 600 }}>(06)</span>
                    <span style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8A8A93" }}>Presented by</span>
                </Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,80px)", alignItems: "start" }}>
                    <Reveal>
                        <Image src="/seaside/lupfr-mark.webp" alt="LUPFR" width={56} height={56} style={{ display: "block", opacity: 0.92, marginBottom: 26 }} />
                        <h2 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(34px,5vw,72px)", lineHeight: 0.96, letterSpacing: "0.01em", textTransform: "uppercase" }}>
                            LUPFR Entertainment
                        </h2>
                        <p style={{ margin: "26px 0 0", maxWidth: "54ch", fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.75, color: "#B9B9B6", fontWeight: 300 }}>
                            SEA <span style={{ color: "#5B8FCB" }}>{"//"}</span> SIDE is a LUPFR original — the offshore franchise of Lupfer Entertainment Group. LUPFR builds
                            artist-first live music across Los Angeles and San Francisco, turning unexpected spaces into venues — from intimate boiler-room sets to
                            full-scale yacht takeovers.
                        </p>
                        <p style={{ margin: "18px 0 0", maxWidth: "54ch", fontSize: 14, lineHeight: 1.75, color: "#8A8A93" }}>
                            Same production DNA as its sister franchises, with its own name, wordmark, and identity.
                        </p>
                        <a
                            href="https://lupfr.com"
                            target="_blank"
                            rel="noreferrer"
                            className="ss-link"
                            style={{ display: "inline-block", marginTop: 26, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", borderBottom: "1px solid rgba(245,245,242,0.3)", paddingBottom: 4 }}
                        >
                            lupfr.com ↗
                        </a>
                    </Reveal>
                    <Reveal delay={120}>
                        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8A8A93", marginBottom: 8 }}>The LUPFR family</div>
                        <div style={{ borderTop: "1px solid rgba(245,245,242,0.14)" }}>
                            {LUPFR_FAMILY.map((item) => (
                                <div
                                    key={item.name}
                                    style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "18px 0", borderBottom: "1px solid rgba(245,245,242,0.09)" }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "var(--font-anton), sans-serif",
                                            fontSize: "clamp(22px,2.4vw,30px)",
                                            textTransform: "uppercase",
                                            color: item.highlight ? "#5B8FCB" : "#F5F5F2",
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                    <span style={{ fontSize: 12, letterSpacing: "0.06em", color: "#8A8A93", textAlign: "right" }}>{item.note}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

/* ============================================================
 * Footer
 * ============================================================ */
interface FooterProps {
    onRequestAccess: () => void
    onPartner: () => void
}

function SeasideFooter({ onRequestAccess, onPartner }: FooterProps) {
    return (
        <footer id="contact" style={{ position: "relative", overflow: "hidden", background: "#0B0B0F", borderTop: "1px solid rgba(245,245,242,0.08)" }}>
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/seaside/candid-disco.webp')", backgroundSize: "cover", backgroundPosition: "center 40%" }} />
            </div>
            <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(180deg,rgba(11,11,15,0.82) 0%,rgba(11,11,15,0.72) 45%,rgba(11,11,15,0.96) 100%)" }} />
            <div style={{ position: "relative", zIndex: 3, maxWidth: 1500, margin: "0 auto", padding: "clamp(80px,13vh,150px) clamp(20px,5vw,64px) clamp(36px,5vh,54px)" }}>
                <Reveal>
                    <div style={{ fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: "#5B8FCB", fontWeight: 600, marginBottom: 20 }}>
                        Come Aboard
                    </div>
                    <h2 style={{ margin: 0, fontWeight: 200, fontSize: "clamp(44px,10vw,150px)", lineHeight: 0.9, letterSpacing: "0.08em" }}>SEA // SIDE</h2>
                    <p style={{ margin: "24px 0 0", fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(26px,4vw,58px)", textTransform: "uppercase", color: "#5B8FCB", lineHeight: 1, letterSpacing: "0.01em" }}>
                        The water is calling.
                    </p>
                    <div style={{ width: 130, height: 4, background: "#3A6EA5", margin: "clamp(26px,4vh,38px) 0 clamp(24px,3.5vh,32px)" }} />
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={onRequestAccess}
                            className="ss-btn-solid"
                            style={{ border: "none", background: "#F5F5F2", color: "#0B0B0F", padding: "17px 40px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                        >
                            Request Access
                        </button>
                        <button
                            type="button"
                            onClick={onPartner}
                            className="ss-btn-outline"
                            style={{ border: "1px solid rgba(245,245,242,0.5)", background: "transparent", color: "#F5F5F2", padding: "17px 40px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                        >
                            Partner With Us
                        </button>
                    </div>
                </Reveal>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 30, flexWrap: "wrap", marginTop: "clamp(56px,9vh,100px)", paddingTop: 34, borderTop: "1px solid rgba(245,245,242,0.12)" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,245,242,0.5)" }}>An Offshore Music Experience</div>
                    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div>
                            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,245,242,0.4)", marginBottom: 9 }}>Follow</div>
                            <a href="https://www.instagram.com/seaside.la/" target="_blank" rel="noreferrer" className="ss-link-color" style={{ fontSize: 14, letterSpacing: "0.08em" }}>
                                @seaside.la
                            </a>
                        </div>
                        <div>
                            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(245,245,242,0.4)", marginBottom: 9 }}>Presented By</div>
                            <a
                                href="https://lupfr.com"
                                target="_blank"
                                rel="noreferrer"
                                className="ss-link-color"
                                style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, letterSpacing: "0.08em" }}
                            >
                                <Image src="/seaside/lupfr-mark.webp" alt="" width={24} height={24} style={{ display: "block", opacity: 0.85 }} />
                                LUPFR
                            </a>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 34, fontSize: 11, letterSpacing: "0.08em", color: "rgba(245,245,242,0.35)" }}>
                    <div>© 2026 Lupfer Entertainment Group LLC. All rights reserved.</div>
                    <div>21+ · Invite-Only · Long Beach, CA</div>
                </div>
            </div>
        </footer>
    )
}

/* ============================================================
 * Access / partner modal
 * ============================================================ */
function buildAccessName(name: string, handle: string, referrer: string): string {
    let out = `${name} — SEA//SIDE access`
    if (handle) out += `, IG ${handle}`
    if (referrer) out += `, ref ${referrer}`
    return out
}

function buildPartnerName(name: string, company: string, message: string): string {
    let out = `${name} — SEA//SIDE partner`
    if (company) out += `, ${company}`
    if (message) out += ` — ${message}`
    return out
}

const MODAL_COPY: Record<ModalIntent, { title: string; sub: string; cta: string; field3: string; field4: string; confirmTitle: string; confirmSub: string }> = {
    access: {
        title: "Request Access",
        sub: "Edition 001 is invite-only. Approved guests receive the POSH link and passcode by email.",
        cta: "Request Access",
        field3: "Instagram handle",
        field4: "Referred by (optional)",
        confirmTitle: "Request received.",
        confirmSub: "You're on the list. Approved guests get the POSH link and passcode by email ahead of August 1.",
    },
    partner: {
        title: "Partner With Us",
        sub: "Tell us about your brand — we'll be in touch about Edition 001 and what's next.",
        cta: "Send Inquiry",
        field3: "Company / brand",
        field4: "What you have in mind",
        confirmTitle: "Inquiry received.",
        confirmSub: "Thanks — the SEA // SIDE team will reach out shortly about partnership.",
    },
}

interface ModalProps {
    open: boolean
    intent: ModalIntent
    form: SeasideFormState
    submitted: boolean
    submitting: boolean
    error: string | null
    onChange: (field: keyof SeasideFormState, value: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    onClose: () => void
}

function SeasideModal(props: ModalProps) {
    const { open, intent, form, submitted, submitting, error, onChange, onSubmit, onClose } = props
    if (!open) return null
    const copy = MODAL_COPY[intent]

    return (
        <div
            onClick={onClose}
            role="presentation"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(6,6,9,0.84)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={copy.title}
                style={{ position: "relative", width: "100%", maxWidth: 520, background: "#101015", border: "1px solid rgba(245,245,242,0.14)", padding: "clamp(28px,4vw,48px)" }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="ss-modal-close"
                    style={{ position: "absolute", top: 16, right: 16, width: 38, height: 38, border: "1px solid rgba(245,245,242,0.2)", background: "transparent", color: "#F5F5F2", cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}
                >
                    ✕
                </button>
                {submitted ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ width: 60, height: 60, border: "1px solid #3A6EA5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#5B8FCB", fontSize: 24 }}>
                            ✓
                        </div>
                        <h3 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "0.01em", textTransform: "uppercase" }}>
                            {copy.confirmTitle}
                        </h3>
                        <p style={{ margin: "14px auto 26px", maxWidth: "36ch", fontSize: 14, lineHeight: 1.65, color: "#8A8A93" }}>{copy.confirmSub}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ss-btn-outline"
                            style={{ border: "1px solid rgba(245,245,242,0.4)", background: "transparent", color: "#F5F5F2", padding: "14px 30px", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: "#5B8FCB", fontWeight: 600, marginBottom: 14 }}>SEA // SIDE</div>
                        <h3 style={{ margin: 0, fontFamily: "var(--font-anton), sans-serif", fontWeight: 400, fontSize: "clamp(28px,3.6vw,42px)", letterSpacing: "0.01em", textTransform: "uppercase" }}>
                            {copy.title}
                        </h3>
                        <p style={{ margin: "12px 0 26px", fontSize: 13.5, lineHeight: 1.65, color: "#8A8A93" }}>{copy.sub}</p>
                        <form onSubmit={onSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                                <input
                                    value={form.name}
                                    onChange={(event) => onChange("name", event.target.value)}
                                    placeholder="Full name"
                                    required
                                    className="ss-input"
                                    style={{ background: "#0B0B0F", border: "1px solid rgba(245,245,242,0.16)", color: "#F5F5F2", padding: "14px 16px", fontSize: 14, fontFamily: "inherit", letterSpacing: "0.02em", outline: "none" }}
                                />
                                <input
                                    value={form.email}
                                    onChange={(event) => onChange("email", event.target.value)}
                                    type="email"
                                    placeholder="Email address"
                                    required
                                    className="ss-input"
                                    style={{ background: "#0B0B0F", border: "1px solid rgba(245,245,242,0.16)", color: "#F5F5F2", padding: "14px 16px", fontSize: 14, fontFamily: "inherit", letterSpacing: "0.02em", outline: "none" }}
                                />
                                <input
                                    value={form.three}
                                    onChange={(event) => onChange("three", event.target.value)}
                                    placeholder={copy.field3}
                                    className="ss-input"
                                    style={{ background: "#0B0B0F", border: "1px solid rgba(245,245,242,0.16)", color: "#F5F5F2", padding: "14px 16px", fontSize: 14, fontFamily: "inherit", letterSpacing: "0.02em", outline: "none" }}
                                />
                                <input
                                    value={form.four}
                                    onChange={(event) => onChange("four", event.target.value)}
                                    placeholder={copy.field4}
                                    className="ss-input"
                                    style={{ background: "#0B0B0F", border: "1px solid rgba(245,245,242,0.16)", color: "#F5F5F2", padding: "14px 16px", fontSize: 14, fontFamily: "inherit", letterSpacing: "0.02em", outline: "none" }}
                                />
                            </div>
                            {error ? <div style={{ marginTop: 12, fontSize: 12, color: "#E88" }}>{error}</div> : null}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="ss-btn-solid"
                                style={{
                                    width: "100%",
                                    marginTop: 20,
                                    border: "none",
                                    background: "#F5F5F2",
                                    color: "#0B0B0F",
                                    padding: 16,
                                    fontSize: 12,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    cursor: submitting ? "default" : "pointer",
                                    fontFamily: "inherit",
                                    opacity: submitting ? 0.6 : 1,
                                }}
                            >
                                {submitting ? "Sending…" : copy.cta}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ============================================================
 * Top-level page component
 * ============================================================ */
export function SeasideLanding() {
    const [editionIdx, setEditionIdx] = useState(0)
    const [edSpecIdx, setEdSpecIdx] = useState(0)
    const [featArtistKey, setFeatArtistKey] = useState<ArtistKey>("hlwa")

    const [modalOpen, setModalOpen] = useState(false)
    const [intent, setIntent] = useState<ModalIntent>("access")
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<SeasideFormState>(EMPTY_FORM)

    useEffect(() => {
        document.documentElement.style.scrollBehavior = "smooth"
        return () => {
            document.documentElement.style.scrollBehavior = ""
        }
    }, [])

    useEffect(() => {
        if (!modalOpen) return
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
        }
    }, [modalOpen])

    useEffect(() => {
        if (!modalOpen) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setModalOpen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [modalOpen])

    const openModal = useCallback((nextIntent: ModalIntent) => {
        setIntent(nextIntent)
        setForm(EMPTY_FORM)
        setSubmitted(false)
        setError(null)
        setModalOpen(true)
    }, [])
    const openAccess = useCallback(() => openModal("access"), [openModal])
    const openPartner = useCallback(() => openModal("partner"), [openModal])
    const closeModal = useCallback(() => setModalOpen(false), [])

    const selectSpec = useCallback((index: number) => setEdSpecIdx(index), [])
    const selectDot = useCallback((index: number) => {
        setEditionIdx(index)
        setEdSpecIdx(0)
    }, [])
    const edPrev = useCallback(() => {
        setEditionIdx((i) => (i - 1 + EDITIONS.length) % EDITIONS.length)
        setEdSpecIdx(0)
    }, [])
    const edNext = useCallback(() => {
        setEditionIdx((i) => (i + 1) % EDITIONS.length)
        setEdSpecIdx(0)
    }, [])
    const selectArtist = useCallback((key: ArtistKey) => setFeatArtistKey(key), [])

    const handleFieldChange = useCallback((field: keyof SeasideFormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }, [])

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const composedName =
                intent === "access" ? buildAccessName(form.name, form.three, form.four) : buildPartnerName(form.name, form.three, form.four)
            setSubmitting(true)
            setError(null)
            fetch("/api/phone-list", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: composedName, email: form.email }),
            })
                .then((response) => {
                    if (!response.ok) throw new Error("Request failed. Please try again.")
                    setSubmitted(true)
                })
                .catch(() => setError("Something went wrong. Please try again."))
                .finally(() => setSubmitting(false))
        },
        [intent, form]
    )

    const edition = EDITIONS[editionIdx] ?? EDITIONS[0]
    const activeSpecIndex = Math.min(edSpecIdx, edition.specs.length - 1)
    const activeImage = edition.specs[activeSpecIndex]?.image ?? edition.heroImage
    const activeArtist = useMemo(() => ARTISTS[featArtistKey], [featArtistKey])

    return (
        <div className="ss-root" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            <style>{SEASIDE_STYLES}</style>
            <SeasideNav onRequestAccess={openAccess} />
            <SeasideHero onRequestAccess={openAccess} />
            <SeasideConcept />
            <SeasideEditions
                edition={edition}
                editionIndex={editionIdx}
                editionCount={EDITIONS.length}
                activeSpecIndex={activeSpecIndex}
                activeImage={activeImage}
                onPrev={edPrev}
                onNext={edNext}
                onSelectSpec={selectSpec}
                onSelectDot={selectDot}
                onRequestAccess={openAccess}
            />
            <SeasideLineup activeArtist={activeArtist} onSelectArtist={selectArtist} />
            <SeasidePartners />
            <SeasideAbout />
            <SeasideFooter onRequestAccess={openAccess} onPartner={openPartner} />
            <SeasideModal
                open={modalOpen}
                intent={intent}
                form={form}
                submitted={submitted}
                submitting={submitting}
                error={error}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
                onClose={closeModal}
            />
        </div>
    )
}
