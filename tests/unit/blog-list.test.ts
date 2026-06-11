import { describe, expect, it } from "vitest"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/blog"

describe("getBlogPosts", () => {
  it("returns a non-empty array", () => {
    expect(getBlogPosts().length).toBeGreaterThan(0)
  })

  it("sorts posts newest-first by publishedAt", () => {
    const posts = getBlogPosts()
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].publishedAt >= posts[i + 1].publishedAt).toBe(true)
    }
  })

  it("normalizes coverImage to start with /", () => {
    for (const post of getBlogPosts()) {
      expect(post.coverImage.startsWith("/"), `${post.slug} coverImage missing leading /`).toBe(true)
    }
  })

  it("every post has required string fields", () => {
    for (const post of getBlogPosts()) {
      expect(typeof post.slug).toBe("string")
      expect(post.slug.length).toBeGreaterThan(0)
      expect(typeof post.title).toBe("string")
      expect(post.title.length).toBeGreaterThan(0)
      expect(typeof post.excerpt).toBe("string")
      expect(typeof post.author).toBe("string")
    }
  })

  it("every post has a non-empty body array", () => {
    for (const post of getBlogPosts()) {
      expect(Array.isArray(post.body)).toBe(true)
      expect(post.body.length, `${post.slug} has empty body`).toBeGreaterThan(0)
    }
  })

  it("publishedAt matches YYYY-MM-DD format", () => {
    const re = /^\d{4}-\d{2}-\d{2}$/
    for (const post of getBlogPosts()) {
      expect(re.test(post.publishedAt), `${post.slug} has invalid publishedAt: ${post.publishedAt}`).toBe(true)
    }
  })

  it("readMinutes is a positive integer", () => {
    for (const post of getBlogPosts()) {
      expect(Number.isInteger(post.readMinutes)).toBe(true)
      expect(post.readMinutes).toBeGreaterThan(0)
    }
  })

  it("tags is an array of strings", () => {
    for (const post of getBlogPosts()) {
      expect(Array.isArray(post.tags)).toBe(true)
      for (const tag of post.tags) {
        expect(typeof tag).toBe("string")
      }
    }
  })
})

describe("getBlogPostBySlug", () => {
  it("returns the correct post for a known slug", () => {
    const post = getBlogPostBySlug("the-first-90-days-building-lupfr")
    expect(post).toBeDefined()
    expect(post!.slug).toBe("the-first-90-days-building-lupfr")
  })

  it("returns undefined for an unknown slug", () => {
    expect(getBlogPostBySlug("no-such-post")).toBeUndefined()
  })

  it("returns posts findable by all slugs from getBlogPosts", () => {
    for (const post of getBlogPosts()) {
      const found = getBlogPostBySlug(post.slug)
      expect(found).toBeDefined()
      expect(found!.id).toBe(post.id)
    }
  })
})
