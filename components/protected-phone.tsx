"use client"

import { useEffect, useState } from "react"

// Phone stored as char codes so it's not plain text in source or initial HTML; decoded and rendered client-side only.
const PHONE_CHAR_CODES = [40, 51, 50, 51, 41, 32, 51, 54, 54, 45, 57, 50, 52, 54]

export function ProtectedPhone() {
  const [decoded, setDecoded] = useState<string | null>(null)
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDecoded(String.fromCharCode(...PHONE_CHAR_CODES))
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [])
  if (!decoded) return <span className="inline-block min-w-[14ch]" aria-hidden />
  return (
    <span
      className="select-none inline-flex items-center gap-0.5 text-foreground"
      aria-label={`Phone: ${decoded}`}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      {decoded.split("").map((char, i) => (
        <span key={i} className="inline-block select-none">
          {char}
        </span>
      ))}
    </span>
  )
}
