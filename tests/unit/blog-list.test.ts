import { describe, expect, it } from "vitest"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data/blog"

const SPECIFIC_BLOG_TERMS: Record<string, string[]> = {
  "week-of-june-15-lupfr-operating-notes": ["FIFA", "GAS MONEY", "ERIA"],
  "yacht-edition-photo-language": ["Boiler Boat", "Pier 40"],
  "turning-gallery-moments-into-memory": ["Where's West"],
  "guest-flow-before-doors-open": ["GAS MONEY", "ERIA"],
  "partner-proof-without-killing-the-room": ["Third Thursday", "Operator SF"],
  "why-the-flyer-still-matters": ["BOILER PARTY", "MARINA"],
  "artist-room-fit-not-just-lineup-size": ["Where's West"],
  "building-the-next-event-from-the-last-one": ["Shamrock & House"],
  "the-first-90-days-building-lupfr": ["BOILER PARTY", "first 90 days"],
  "why-we-design-events-like-story-arcs": ["Boiler Boat"],
  "what-we-changed-after-three-packed-weekends": ["packed weekends"],
}

const OPINION_MARKERS = ["My opinion:", "I refuse", "My stance:", "My take:"]

function postText(slug: string) {
  return getBlogPostBySlug(slug)?.body.join("\n") ?? ""
}

describe("getBlogPosts", () => {
  it("returns a non-empty array", () => {
    expect(getBlogPosts().length).toBeGreaterThan(0)
  })

  it("fills the blog through June 15", () => {
    expect(getBlogPosts()[0]?.publishedAt).toBe("2026-06-15")
  })

  it("keeps a substantial blog run", () => {
    expect(getBlogPosts().length).toBeGreaterThanOrEqual(11)
  })

  it("includes the filled June blog run", () => {
    expect(getBlogPosts().length).toBeGreaterThanOrEqual(11)
  })

  it("fills posts through June 15", () => {
    expect(getBlogPosts()[0]?.publishedAt).toBe("2026-06-15")
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

  it("every post has body paragraphs", () => {
    for (const post of getBlogPosts()) {
      expect(post.body.length, `${post.slug} has no body`).toBeGreaterThan(0)
    }
  })

  it("every post uses markdown-style section headings", () => {
    expect(getBlogPosts().every((post) => post.body.some((line) => line.startsWith("## ")))).toBe(true)
  })

  it("every post includes a source note", () => {
    expect(getBlogPosts().every((post) => post.body.some((line) => line.startsWith("**Source note:**")))).toBe(true)
  })

  it("every post is long-form enough for the editorial blog", () => {
    expect(getBlogPosts().every((post) => post.body.length >= 24)).toBe(true)
  })

  it("every post names its specific event or situation", () => {
    expect(Object.entries(SPECIFIC_BLOG_TERMS).every(([slug, terms]) => terms.some((term) => postText(slug).includes(term)))).toBe(true)
  })

  it("every post uses first-person operator voice", () => {
    expect(getBlogPosts().every((post) => /\bI\b|\bwe\b|\bmy\b|\bour\b/i.test(post.body.join("\n")))).toBe(true)
  })

  it("every post states an opinionated thesis", () => {
    expect(getBlogPosts().every((post) => OPINION_MARKERS.some((marker) => post.body.join("\n").includes(marker)))).toBe(true)
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
