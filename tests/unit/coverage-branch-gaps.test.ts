/**
 * Targeted branch coverage for remaining <90% global branch gap (node env).
 */
import { afterEach, describe, expect, it, vi } from "vitest"
import { resolveDynamicComponent } from "@/lib/dynamic-component"

afterEach(() => {
  vi.doUnmock("@/lib/data/generated/team.json")
  vi.doUnmock("@/lib/data/generated/blog.json")
  vi.resetModules()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("dynamic-component object export branch", () => {
  it("accepts a forwardRef-style object with $$typeof", () => {
    const fake = { $$typeof: Symbol.for("react.forward_ref") }
    expect(resolveDynamicComponent({ Section: fake }, "Section", "fixture")).toBe(fake)
  })

  it("rejects plain objects without $$typeof", () => {
    expect(() => resolveDynamicComponent({ Section: { nope: true } }, "Section", "fixture")).toThrow(
      /must export a React component/,
    )
  })
})

describe("team normalization fallback branches", () => {
  it("normalizes images, filters invalid teams, and derives LA/SF badges", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/team.json", () => ({
      default: [
        {
          name: "No Image",
          title: "Ops",
          location: "Los Angeles, CA",
          image: "   ",
          bio: "Bio",
          teams: ["LA", "Nope"],
        },
        {
          name: "Slashless",
          title: "Prod",
          location: "San Francisco, CA",
          image: "images/team/slashless.webp",
          bio: "Bio",
          teams: "not-an-array",
        },
      ],
    }))
    const { TEAM } = await import("@/lib/data/team")
    expect(TEAM[0].image).toBeUndefined()
    expect(TEAM[0].teams).toEqual(["LA"])
    expect(TEAM[0].badges).toContain("LA")
    expect(TEAM[1].image).toBe("/images/team/slashless.webp")
    expect(TEAM[1].teams).toEqual([])
    expect(TEAM[1].badges).toContain("SF")
  })
})

describe("blog normalization fallback branches", () => {
  it("adds leading slashes and defaults coverImageAlt", async () => {
    vi.resetModules()
    vi.doMock("@/lib/data/generated/blog.json", () => ({
      default: [
        {
          slug: "fixture-post",
          title: "Fixture",
          excerpt: "Ex",
          publishedAt: "2026-01-02",
          readMinutes: 3,
          coverImage: "blog/fixture.webp",
          tags: ["a"],
          body: ["Hi"],
          sections: [
            {
              heading: "Sec",
              body: ["Body"],
              image: { src: "blog/sec.webp", alt: "Sec" },
            },
          ],
        },
      ],
    }))
    const { getBlogPostBySlug, blogPostUrl } = await import("@/lib/data/blog")
    const post = getBlogPostBySlug("fixture-post")
    expect(post?.coverImage).toBe("/blog/fixture.webp")
    expect(post?.coverImageAlt).toBe("Fixture")
    expect(post?.sections[0]?.image.src).toBe("/blog/sec.webp")
    expect(blogPostUrl("fixture-post")).toContain("fixture-post")
  })
})

describe("phone-list preference SSR branches", () => {
  it("returns false / no-ops without window or document", async () => {
    vi.resetModules()
    vi.stubGlobal("window", undefined)
    vi.stubGlobal("document", undefined)
    const mod = await import("@/lib/phone-list-preferences")
    expect(mod.hasPhoneListPreference(mod.PHONE_LIST_DISMISSED_KEY)).toBe(false)
    expect(() => mod.setPhoneListPreference(mod.PHONE_LIST_DISMISSED_KEY)).not.toThrow()
    expect(mod.hasPhoneListCookie(mod.PHONE_LIST_DISMISSED_COOKIE)).toBe(false)
    expect(() => mod.setPhoneListCookie(mod.PHONE_LIST_DISMISSED_COOKIE)).not.toThrow()
  })
})
