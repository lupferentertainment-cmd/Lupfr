import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { getBlogPosts } from "@/lib/data/blog"
import { SITE_URL } from "@/lib/site"

const BLOG_IMAGE_WIDTH = 1400
const BLOG_IMAGE_HEIGHT = 900

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Blog | LUPFR",
  description: "Notes from the LUPFR journey: events, production, and lessons from the road.",
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogIndexPage() {
  const posts = getBlogPosts()

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-28 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <header className="mb-10 sm:mb-12">
            <Link
              href="/"
              prefetch
              className="text-muted-foreground hover:text-foreground mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium tracking-normal transition-colors"
            >
              <ArrowLeft size={16} aria-hidden />
              Back to home
            </Link>
            <GoldShineText as="h1">Blog</GoldShineText>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Stories, lessons, and behind-the-scenes notes from building LUPFR.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <Link href={`/blog/${post.slug}`} prefetch className="flex h-full flex-col">
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={BLOG_IMAGE_WIDTH}
                      height={BLOG_IMAGE_HEIGHT}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span>{post.publishedAt}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={13} aria-hidden />
                        {post.readMinutes} min read
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">{post.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Read article
                      <ArrowUpRight size={15} aria-hidden />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
