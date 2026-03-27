import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-x-clip flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center">
        <Link href="/" className="mb-10 block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl">
          <Image
            src="/logos/will_logo.png"
            alt="LUPFR Entertainment"
            width={120}
            height={120}
            className="mx-auto h-24 w-24 sm:h-28 sm:w-28 object-contain opacity-95"
            priority
          />
        </Link>
        <p className="text-gold-accent uppercase tracking-[0.3em] text-xs sm:text-sm mb-4">404</p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Page not found
        </h1>
        <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
          This URL isn&apos;t on our site. Head back home or open Events from the menu.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 btn-metallic-gold font-semibold uppercase tracking-wider rounded-full"
        >
          Back to home
        </Link>
      </div>
      <Footer />
    </main>
  )
}
