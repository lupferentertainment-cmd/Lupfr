/* eslint-disable @next/next/no-img-element -- Routed 404 must stay self-contained and avoid client reference manifests. */

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-x-clip flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Keep 404 free of framework client link references. */}
      <a href="/" className="mb-10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl">
        <img
          src="/logos/will_logo.png"
          width="120"
          height="120"
          className="mx-auto h-24 w-24 sm:h-28 sm:w-28 object-contain opacity-95"
          alt="LUPFR Entertainment"
        />
      </a>
      <p className="text-gold-accent tracking-tight text-xs sm:text-sm mb-4">404</p>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4">
        Page not found
      </h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        This URL isn&apos;t on our site. Head back home or open Events from the menu.
      </p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Keep 404 free of framework client link references. */}
      <a
        href="/"
        className="inline-flex items-center justify-center px-8 py-4 btn-metallic-gold font-semibold tracking-normal rounded-full"
      >
        Back to home
      </a>
    </main>
  )
}
