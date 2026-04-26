import type { Metadata } from "next"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TERMS_NOT_PUBLISHED_COPY } from "@/lib/legal-copy"
import { SITE_URL } from "@/lib/site"

const title = "Terms of Service"

export const metadata: Metadata = {
  title,
  description: "LUPFR terms and commercial inquiries for lupfr.com.",
  alternates: { canonical: `${SITE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip">
      <Navigation />
      <div className="container mx-auto max-w-2xl flex-1 px-4 py-24 sm:py-32">
        <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {TERMS_NOT_PUBLISHED_COPY}
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-2 hover:text-gold-accent"
          >
            Privacy &amp; cookies
          </Link>{" "}
          explains how we use storage and data on this site.
        </p>
      </div>
      <Footer />
    </main>
  )
}
