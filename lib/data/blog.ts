import blogJson from "@/lib/data/generated/blog.json"

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  readMinutes: number
  coverImage: string
  tags: string[]
  body: string[]
}

function toImagePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

const BLOG_POSTS_SORTED: BlogPost[] = (blogJson as BlogPost[])
  .map((post) => ({ ...post, coverImage: toImagePath(post.coverImage) }))
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

export function getBlogPosts(): BlogPost[] {
  return BLOG_POSTS_SORTED
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS_SORTED.find((post) => post.slug === slug)
}
