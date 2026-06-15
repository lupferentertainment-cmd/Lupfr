import blogJson from "@/lib/data/generated/blog.json"
import { BLOG_URL } from "@/lib/site"

export interface BlogImage {
  src: string
  alt: string
}

export interface BlogSection {
  heading: string
  body: string
  image: BlogImage
}

interface RawBlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  readMinutes: number
  coverImage: string
  coverImageAlt?: string
  tags: string[]
  body: string[]
  sections?: BlogSection[]
}

export interface BlogPost extends RawBlogPost {
  coverImageAlt: string
  sections: BlogSection[]
}

function toImagePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

function toSection(section: BlogSection): BlogSection {
  return { ...section, image: { ...section.image, src: toImagePath(section.image.src) } }
}

function toPost(post: RawBlogPost): BlogPost {
  return {
    ...post,
    coverImage: toImagePath(post.coverImage),
    coverImageAlt: post.coverImageAlt ?? post.title,
    sections: (post.sections ?? []).map(toSection),
  }
}

const BLOG_POSTS_SORTED: BlogPost[] = (blogJson as RawBlogPost[]).map(toPost).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

export const BLOG_POSTS = BLOG_POSTS_SORTED

export function getBlogPosts(): BlogPost[] {
  return BLOG_POSTS_SORTED
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS_SORTED.find((post) => post.slug === slug)
}

export function blogPostUrl(slug: string): string {
  return `${BLOG_URL}/${slug}`
}
