/**
 * ARCHIVED: Hero floating-quotes component.
 * Previously used in components/hero.tsx to show music quotes floating around the hero.
 * Kept in _deprecated for potential reuse. Not imported anywhere.
 *
 * To re-enable: copy the types, constants, helpers, and JSX back into hero.tsx
 * and restore the quote state + useEffect + render block.
 */

"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useState, useEffect, useRef } from "react"

export type FloatingQuote = { id: number; text: string; author: string; x: number; y: number; sizeScale: number }

export const HERO_QUOTES = [
  { text: "One good thing about music—when it hits you, you feel no pain.", author: "Bob Marley" },
  { text: "Music gives a soul to the universe, wings to the mind, flight to the imagination.", author: "Plato" },
  { text: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
  { text: "Music is the soundtrack of your life.", author: "Dick Clark" },
  { text: "Life is one grand, sweet song, so start the music.", author: "Ronald Reagan" },
  { text: "Music was my refuge. I could crawl into the space between the notes.", author: "Maya Angelou" },
  { text: "The only truth is music.", author: "Jack Kerouac" },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
  { text: "Music is the divine way to tell beautiful, poetic things to the heart.", author: "Pablo Casals" },
  { text: "Music washes away from the soul the dust of everyday life.", author: "Berthold Auerbach" },
  { text: "If I were not a physicist, I would probably be a musician.", author: "Albert Einstein" },
  { text: "Music can change the world because it can change people.", author: "Bono" },
  { text: "After silence, that which comes nearest to expressing the inexpressible is music.", author: "Aldous Huxley" },
  { text: "Music is the shorthand of emotion.", author: "Leo Tolstoy" },
  { text: "To play a wrong note is insignificant; to play without passion is inexcusable.", author: "Ludwig van Beethoven" },
  { text: "One good thing about music—when it hits you, you feel no pain.", author: "Bob Marley" },
  { text: "Music is the universal language of mankind.", author: "Henry Wadsworth Longfellow" },
  { text: "Music expresses that which cannot be said.", author: "Victor Hugo" },
  { text: "A painter paints pictures on canvas. But musicians paint their pictures on silence.", author: "Leopold Stokowski" },
  { text: "Music is the wine that fills the cup of silence.", author: "Robert Fripp" },
  { text: "Music is the strongest form of magic.", author: "Marilyn Manson" },
  { text: "Music produces a kind of pleasure which human nature cannot do without.", author: "Confucius" },
  { text: "Music is the art which is most nigh to tears and memory.", author: "Oscar Wilde" },
  { text: "Music is the movement of sound to reach the soul for the education of its virtue.", author: "Plato" },
  { text: "Take a music bath once or twice a week.", author: "Oliver Wendell Holmes" },
]

const QUOTE_EXCLUDE_CENTER = { xMin: 32, xMax: 68, yMin: 28, yMax: 62 }
const QUOTE_EXCLUDE_NAVBAR_Y_MAX = 12
const MIN_QUOTE_DISTANCE_PCT = 54
const QUOTE_ZONES: [number, number, number, number][] = [
  [4, 30, 14, 28],
  [70, 96, 14, 28],
  [4, 30, 64, 90],
  [70, 96, 64, 90],
  [4, 30, 28, 62],
  [70, 96, 28, 62],
]

function isInCenter(x: number, y: number): boolean {
  return (
    x >= QUOTE_EXCLUDE_CENTER.xMin && x <= QUOTE_EXCLUDE_CENTER.xMax &&
    y >= QUOTE_EXCLUDE_CENTER.yMin && y <= QUOTE_EXCLUDE_CENTER.yMax
  )
}

function isInNavbar(y: number): boolean {
  return y < QUOTE_EXCLUDE_NAVBAR_Y_MAX
}

function getZoneIndex(x: number, y: number): number {
  for (let i = 0; i < QUOTE_ZONES.length; i++) {
    const [xMin, xMax, yMin, yMax] = QUOTE_ZONES[i]
    if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) return i
  }
  return -1
}

function randomQuotePosition(existing: { x: number; y: number }[]): { x: number; y: number } | null {
  const zoneCounts = new Array(QUOTE_ZONES.length).fill(0)
  existing.forEach(({ x, y }) => {
    const z = getZoneIndex(x, y)
    if (z >= 0) zoneCounts[z]++
  })
  const minCount = Math.min(...zoneCounts)
  const candidateZones = QUOTE_ZONES
    .map((_, i) => i)
    .filter((i) => zoneCounts[i] <= minCount + 1)
  const maxTries = 120
  for (let t = 0; t < maxTries; t++) {
    const zoneIdx = candidateZones[Math.floor(Math.random() * candidateZones.length)]
    const [xMin, xMax, yMin, yMax] = QUOTE_ZONES[zoneIdx]
    const x = xMin + Math.random() * (xMax - xMin)
    const y = yMin + Math.random() * (yMax - yMin)
    if (isInNavbar(y)) continue
    if (isInCenter(x, y)) continue
    const tooClose = existing.some((e) => Math.hypot(x - e.x, y - e.y) < MIN_QUOTE_DISTANCE_PCT)
    if (!tooClose) return { x, y }
  }
  return null
}

function randomSizeScale(): number {
  const scales = [0.72, 0.85, 0.95, 1, 1.08, 1.18, 1.28]
  return scales[Math.floor(Math.random() * scales.length)]
}

const QUOTE_SPAWN_INTERVAL_MS = 1400
const QUOTE_VISIBLE_MS = 5200
const QUOTE_FADE_IN_MS = 800
const QUOTE_FADE_OUT_MS = 1200
const MAX_ACTIVE_QUOTES = 8
const QUOTES_PER_SPAWN = 1

/** Standalone archived component — not used. Export for reference only. */
export function HeroFloatingQuotesArchived({
  prefersReducedMotion,
  isMobile,
}: {
  prefersReducedMotion: boolean | null
  isMobile: boolean | null
}) {
  const [floatingQuotes, setFloatingQuotes] = useState<FloatingQuote[]>([])
  const floatingQuotesRef = useRef<FloatingQuote[]>([])
  const nextQuoteIdRef = useRef(0)
  floatingQuotesRef.current = floatingQuotes

  useEffect(() => {
    if (prefersReducedMotion || isMobile !== false) return
    const spawnOne = (pendingPositions: { x: number; y: number }[]) => {
      const existing = floatingQuotesRef.current.map((q) => ({ x: q.x, y: q.y }))
      const allBlocked = [...existing, ...pendingPositions]
      const pos = randomQuotePosition(allBlocked)
      if (pos === null) return undefined
      const q = HERO_QUOTES[Math.floor(Math.random() * HERO_QUOTES.length)]
      const id = nextQuoteIdRef.current++
      const sizeScale = randomSizeScale()
      setFloatingQuotes((prev) => {
        const next = [...prev, { id, text: q.text, author: q.author, x: pos.x, y: pos.y, sizeScale }]
        if (next.length > MAX_ACTIVE_QUOTES) return next.slice(next.length - MAX_ACTIVE_QUOTES)
        return next
      })
      setTimeout(() => {
        setFloatingQuotes((prev) => prev.filter((item) => item.id !== id))
      }, QUOTE_VISIBLE_MS)
      return pos
    }
    const spawn = () => {
      const pending: { x: number; y: number }[] = []
      for (let i = 0; i < QUOTES_PER_SPAWN; i++) {
        const pos = spawnOne(pending)
        if (pos) pending.push(pos)
      }
    }
    const t = setInterval(spawn, QUOTE_SPAWN_INTERVAL_MS)
    spawn()
    return () => clearInterval(t)
  }, [prefersReducedMotion, isMobile])

  return (
    <div className="absolute inset-0 z-[7] pointer-events-none overflow-hidden" aria-hidden>
      <AnimatePresence>
        {floatingQuotes.map((q) => (
          <motion.div
            key={q.id}
            className="absolute max-w-[min(260px,70vw)] px-3 py-2 origin-center"
            style={{
              left: `${q.x}%`,
              top: `${q.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{
              opacity: prefersReducedMotion ? 0.6 : 0.88,
              scale: q.sizeScale,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: QUOTE_FADE_IN_MS / 1000, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: QUOTE_FADE_IN_MS / 1000, ease: [0.22, 1, 0.36, 1] },
              exit: { duration: QUOTE_FADE_OUT_MS / 1000, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <p className="text-xs sm:text-sm font-bold text-accent leading-snug tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] [text-shadow:0_0_20px_var(--gold-filter-shadow)]">
              &ldquo;{q.text}&rdquo;
            </p>
            <p className="mt-1.5 text-[9px] sm:text-[10px] text-accent/85 font-semibold tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              — {q.author}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
