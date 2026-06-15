import type { Metadata } from "next"
import type { ReactElement } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock3 } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/blog"
import { SITE_URL } from "@/lib/site"

const BLOG_IMAGE_WIDTH = 1400
const BLOG_IMAGE_HEIGHT = 900
const BLOG_BLOCK_DELAY_CAP = 14

type BlogPageParams = { params: Promise<{ slug: string }> }
type BlogPost = NonNullable<ReturnType<typeof getBlogPostBySlug>>
type BlogBlockKind = "heading" | "subheading" | "quote" | "bullet" | "source" | "paragraph"
type BlogBlock = { kind: BlogBlockKind; text: string }
type BlogBlockRenderer = (block: BlogBlock, index: number) => ReactElement

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPageParams): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) return { metadataBase: new URL(SITE_URL), title: "Blog | LUPFR" }
  return postMetadata(post)
}

function postMetadata(post: BlogPost): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    metadataBase: new URL(SITE_URL),
    title: `${post.title} | LUPFR Blog`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.excerpt, type: "article", url, images: [{ url: post.coverImage }] },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [post.coverImage] },
  }
}

function ArticleMeta({ post }: { post: BlogPost }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
      <span>By {post.author}</span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 size={15} aria-hidden />
        {post.readMinutes} min read
      </span>
    </p>
  )
}

function ArticleCover({ post }: { post: BlogPost }) {
  return (
    <figure className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-accent/25 bg-muted shadow-2xl shadow-black/30">
      <Image src={post.coverImage} alt={post.title} width={BLOG_IMAGE_WIDTH} height={BLOG_IMAGE_HEIGHT} priority sizes="(max-width: 768px) 100vw, 896px" className="h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent" aria-hidden />
    </figure>
  )
}

function trimMarker(text: string, marker: string): string {
  return text.slice(marker.length).trim()
}

function parseBlogBlock(text: string): BlogBlock {
  const trimmed = text.trim()
  if (trimmed.startsWith("### ")) return { kind: "subheading", text: trimMarker(trimmed, "### ") }
  if (trimmed.startsWith("## ")) return { kind: "heading", text: trimMarker(trimmed, "## ") }
  if (trimmed.startsWith("> ")) return { kind: "quote", text: trimMarker(trimmed, "> ") }
  if (trimmed.startsWith("- ")) return { kind: "bullet", text: trimMarker(trimmed, "- ") }
  if (trimmed.startsWith("**Source note:**")) return { kind: "source", text: trimMarker(trimmed, "**Source note:**") }
  return { kind: "paragraph", text: trimmed }
}

function delayClassName(index: number): string {
  return `blog-delay-${Math.min(index, BLOG_BLOCK_DELAY_CAP)}`
}

function blockClassName(index: number, extra: string): string {
  return `blog-article-block ${delayClassName(index)} ${extra}`
}

const BLOG_BLOCK_RENDERERS: Record<BlogBlockKind, BlogBlockRenderer> = {
  heading: (block, index) => <h2 key={index} className={blockClassName(index, "blog-article-heading")}>{block.text}</h2>,
  subheading: (block, index) => <h3 key={index} className={blockClassName(index, "blog-article-subheading")}>{block.text}</h3>,
  quote: (block, index) => <blockquote key={index} className={blockClassName(index, "blog-article-quote")}>{block.text}</blockquote>,
  bullet: (block, index) => <p key={index} className={blockClassName(index, "blog-article-bullet")}>{block.text}</p>,
  source: (block, index) => <p key={index} className={blockClassName(index, "blog-article-source")}>Source note: {block.text}</p>,
  paragraph: (block, index) => <p key={index} className={blockClassName(index, "blog-article-paragraph")}>{block.text}</p>,
}

function renderBlogBlock(text: string, index: number): ReactElement {
  const block = parseBlogBlock(text)
  return BLOG_BLOCK_RENDERERS[block.kind](block, index)
}

function ArticleBody({ post }: { post: BlogPost }) {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-2xl shadow-black/15 sm:p-9 lg:p-11">
      <div className="blog-article-prose">
        {post.body.map(renderBlogBlock)}
      </div>
    </div>
  )
}

function TagRow({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-border/70 pt-8">
      {post.tags.map((tag) => <span key={tag} className="rounded-full border border-accent/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{tag}</span>)}
    </div>
  )
}

export default async function BlogPostPage({ params }: BlogPageParams) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) notFound()
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="bg-[radial-gradient(circle_at_78%_4%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_30rem)] pt-28 sm:pt-32 md:pt-36">
        <article className="container mx-auto grid max-w-5xl gap-9 px-4 pb-20 sm:px-6 sm:pb-28">
          <header>
            <ArticleMeta post={post} />
            <h1 className="mt-5 font-serif text-5xl font-bold leading-none tracking-tight text-foreground sm:text-6xl md:text-7xl">{post.title}</h1>
            <Link href="/blog" prefetch className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft size={16} aria-hidden />
              Back to blog
            </Link>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground">{post.excerpt}</p>
          </header>
          <ArticleCover post={post} />
          <ArticleBody post={post} />
          <TagRow post={post} />
        </article>
      </div>
      <Footer />
    </main>
  )
}
