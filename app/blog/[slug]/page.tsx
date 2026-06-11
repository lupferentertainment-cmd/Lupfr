import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock3 } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/blog"
import { SITE_URL } from "@/lib/site"

type BlogPageParams = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPageParams): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Blog | LUPFR",
    }
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: `${post.title} | LUPFR Blog`,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [{ url: post.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPageParams) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-28 px-4 sm:px-6">
        <article className="container mx-auto max-w-3xl">
          <Link
            href="/blog"
            prefetch
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium tracking-normal transition-colors"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to blog
          </Link>

          <header className="mb-8 border-b border-border pb-6">
            <h1 className="font-serif text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{post.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>By {post.author}</span>
              <span>{post.publishedAt}</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={13} aria-hidden />
                {post.readMinutes} min read
              </span>
            </div>
          </header>

          <div className="space-y-5 text-[1.04rem] leading-8 text-foreground/95">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Tags: {post.tags.join(" · ")}
            </p>
          </div>
        </article>
      </div>
      <Footer />
    </main>
  )
}
