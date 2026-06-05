"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error(error)
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-4 py-24 text-center">
          <p className="mb-4 text-xs tracking-tight text-gold-accent sm:text-sm">Application error</p>
          <h1 className="mb-4 font-serif text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Something went sideways
          </h1>
          <p className="mb-10 max-w-md leading-relaxed text-muted-foreground">
            The app hit an unexpected error. Try again, or head back home.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold tracking-normal btn-metallic-gold"
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global error bypasses the normal App Router tree. */}
            <a href="/" className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 font-semibold tracking-normal text-foreground">
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
