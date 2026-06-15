import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { getBlogPosts, type BlogPost } from "@/lib/data/blog"
import { SITE_URL } from "@/lib/site"

const BLOG_IMAGE_WIDTH = 1400
const BLOG_IMAGE_HEIGHT = 900
const FEATURED_POST_COUNT = 1
const BLOG_DESCRIPTION = "Stories, lessons, and behind-the-scenes notes from building LUPFR."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Blog | LUPFR",
  description: "Notes from the LUPFR journey: events, production, and lessons from the road.",
  alternates: { canonical: `${SITE_URL}/blog` },
}

function postHref(post: BlogPost): string {
  return `/blog/${post.slug}`
}

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
      <span>{post.publishedAt}</span>
      <span className="inline-flex shrink-0 items-center gap-1.5">
        <Clock3 size={14} aria-hidden />
        {post.readMinutes} min read
      </span>
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/70 shadow-2xl shadow-black/15 transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:bg-card">
      <Link href={postHref(post)} prefetch className="flex h-full flex-col">
        <div className="relative aspect-[16/11] overflow-hidden bg-muted">
          <Image src={post.coverImage} alt={post.title} width={BLOG_IMAGE_WIDTH} height={BLOG_IMAGE_HEIGHT} sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
          <span className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-70" aria-hidden />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
          <PostMeta post={post} />
          <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">{post.title}</h2>
          <p className="text-base leading-7 text-muted-foreground">{post.excerpt}</p>
          <span className="mt-auto inline-flex w-fit items-center gap-2 font-semibold text-accent transition-colors group-hover:text-foreground">
            Read article
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  )
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="group grid overflow-hidden rounded-[2rem] border border-accent/25 bg-card/75 shadow-2xl shadow-black/25 md:grid-cols-[1.1fr_0.9fr]">
      <Link href={postHref(post)} prefetch className="relative min-h-[20rem] overflow-hidden bg-muted">
        <Image src={post.coverImage} alt={post.title} width={BLOG_IMAGE_WIDTH} height={BLOG_IMAGE_HEIGHT} priority sizes="(max-width: 768px) 100vw, 55vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute inset-0 bg-gradient-to-r from-background/15 via-transparent to-background/75" aria-hidden />
      </Link>
      <div className="flex flex-col justify-center gap-5 p-7 sm:p-9 lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Latest note</p>
        <h2 className="font-serif text-4xl font-bold leading-none tracking-tight text-foreground sm:text-5xl">{post.title}</h2>
        <p className="text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
        <Link href={postHref(post)} prefetch className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 px-5 py-3 font-semibold text-accent transition hover:border-accent hover:bg-accent/10 hover:text-foreground">
          Read latest
          <ArrowUpRight size={17} aria-hidden />
        </Link>
      </div>
    </article>
  )
}

function BlogHeader() {
  return (
    <header className="container mx-auto flex max-w-7xl flex-col px-4 pb-12 sm:px-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-accent">LUPFR notes</p>
      <GoldShineText as="h1">Blog</GoldShineText>
      <Link href="/" prefetch className="mt-5 flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={16} aria-hidden />
        Back to home
      </Link>
      <p className="mt-7 max-w-3xl text-xl leading-8 text-muted-foreground">{BLOG_DESCRIPTION}</p>
    </header>
  )
}

function getFeaturedPost(posts: BlogPost[]): BlogPost {
  const post = posts[0]
  if (!post) throw new Error("Blog requires at least one post")
  return post
}

function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const featuredPost = getFeaturedPost(posts)
  const remainingPosts = posts.slice(FEATURED_POST_COUNT)
  return (
    <section className="container mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 sm:pb-28">
      <FeaturedPost post={featuredPost} />
      <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {remainingPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

export default function BlogIndexPage() {
  const posts = getBlogPosts()
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent_28rem)] pt-28 sm:pt-32 md:pt-36">
        <BlogHeader />
        <BlogGrid posts={posts} />
      </div>
      <Footer />
    </main>
  )
}
