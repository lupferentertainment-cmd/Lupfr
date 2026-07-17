import { describe, expect, it } from "vitest"
import { getServiceBySlug, getServices, servicePath, serviceSlug } from "@/lib/data/services"

describe("service routes", () => {
  it("creates a dedicated page path for every service", () => {
    const services = getServices()
    const paths = services.map(servicePath)

    expect(paths).toContain("/services/owned-events")
    expect(paths).toContain("/services/brand-partnerships")
    expect(new Set(paths).size).toBe(services.length)
  })

  it("normalizes service titles into URL slugs", () => {
    expect(serviceSlug("  Sound & Lighting  ")).toBe("sound-lighting")
  })

  it("resolves every service by its slug and rejects unknown slugs", () => {
    for (const service of getServices()) {
      expect(getServiceBySlug(serviceSlug(service.title))).toBe(service)
    }
    expect(getServiceBySlug("not-a-service")).toBeUndefined()
  })
})
