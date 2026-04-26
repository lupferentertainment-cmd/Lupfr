"use client"

import { useCallback, useState } from "react"
import { Copy, Facebook, Instagram, Linkedin, Share2 } from "lucide-react"
import { toast } from "sonner"
import { LINKS } from "@/lib/links"
import { cn } from "@/lib/utils"

/** X (Twitter) mark — Lucide `X` is a generic close icon; this matches the platform glyph. */
function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function shareLink(url: string, title: string): { twitter: string; facebook: string; linkedin: string } {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return {
    twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  }
}

export type GalleryShareRowProps = {
  shareUrl: string
  /** Pre-composed line, e.g. "LUPFR — Where's West? 004" */
  shareTitle: string
  className?: string
  dense?: boolean
  /** Overrides default "Share this photo" for other contexts (e.g. events). */
  groupAriaLabel?: string
}

export function GalleryShareRow({
  shareUrl,
  shareTitle,
  className,
  dense,
  groupAriaLabel = "Share this photo",
}: GalleryShareRowProps) {
  const [copied, setCopied] = useState(false)
  const links = shareLink(shareUrl, shareTitle)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied")
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy link")
    }
  }, [shareUrl])

  const nativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      await copy()
      return
    }
    try {
      await navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl })
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return
      await copy()
    }
  }, [copy, shareTitle, shareUrl])

  const btn =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/75 px-3.5 text-xs font-medium tracking-normal text-foreground shadow-sm backdrop-blur-md transition-all duration-200 hover:border-border hover:bg-accent/[0.12] hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  const iconClass = "size-4 shrink-0 opacity-90"

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        dense ? "" : "gap-3",
        className
      )}
      role="group"
      aria-label={groupAriaLabel}
    >
      <button type="button" onClick={nativeShare} className={btn}>
        <Share2 className={iconClass} aria-hidden />
        Share
      </button>
      <a
        href={links.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        <IconX className={iconClass} />
        <span className="whitespace-nowrap">X / Twitter</span>
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        <Facebook className={iconClass} aria-hidden />
        Facebook
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        <Linkedin className={iconClass} aria-hidden />
        LinkedIn
      </a>
      <a
        href={LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        <Instagram className={iconClass} aria-hidden />
        Instagram
      </a>
      <button type="button" onClick={copy} className={btn}>
        <Copy className={iconClass} aria-hidden />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  )
}
