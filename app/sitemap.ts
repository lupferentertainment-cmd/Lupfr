import type { MetadataRoute } from 'next'
import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { EVENTS } from '@/lib/events'
import { GALLERY_PHOTOS } from '@/lib/data/gallery'
import { getBlogPosts } from '@/lib/data/blog'
import { BLOG_PUBLIC_ACCESS_ENABLED } from '@/lib/site'

const siteUrl = 'https://lupfr.com'

type RouteFrequency = MetadataRoute.Sitemap[number]['changeFrequency']

async function collectStaticAppRoutes(dir: string, appRoot: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const routes: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      routes.push(...(await collectStaticAppRoutes(fullPath, appRoot)))
      continue
    }

    const isPageFile = entry.name === 'page.tsx' || entry.name === 'page.ts'
    if (!isPageFile) continue

    const relativeDir = relative(appRoot, dir).replace(/\\/g, '/')
    const normalizedDir = relativeDir === '.' ? '' : relativeDir

    const segments = normalizedDir.split('/').filter(Boolean)
    if (segments.some((segment) => segment === 'api')) continue
    if (segments.some((segment) => segment.startsWith('(') && segment.endsWith(')'))) continue
    if (segments.some((segment) => segment.startsWith('[') && segment.endsWith(']'))) continue

    const route = segments.length === 0 ? '/' : `/${segments.join('/')}`
    routes.push(route)
  }

  return routes
}

function routeToMetadata(route: string): MetadataRoute.Sitemap[number] {
  const isHome = route === '/'
  const changeFrequency: RouteFrequency = isHome ? 'weekly' : 'monthly'
  return {
    url: isHome ? siteUrl : `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority: isHome ? 1 : 0.8,
  }
}

function isPublicRoute(route: string): boolean {
  // /seaside is decommissioned (2026-07-08) — it 308-redirects to seaside.la, so
  // it must not be advertised in this site's sitemap.
  if (route === '/seaside') return false
  if (BLOG_PUBLIC_ACCESS_ENABLED) return true
  return route !== '/blog' && !route.startsWith('/blog/')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appRoot = join(process.cwd(), 'app')
  const staticRoutes = (await collectStaticAppRoutes(appRoot, appRoot)).filter(isPublicRoute)
  const eventRoutes = EVENTS.map((event) => `/events/${event.slug}`)
  const galleryPhotoRoutes = GALLERY_PHOTOS.map((p) => `/gallery/p/${p.id}`)
  const blogRoutes = BLOG_PUBLIC_ACCESS_ENABLED ? getBlogPosts().map((post) => `/blog/${post.slug}`) : []

  const allRoutes = [...new Set([...staticRoutes, ...eventRoutes, ...galleryPhotoRoutes, ...blogRoutes])].sort((a, b) =>
    a.localeCompare(b)
  )

  return allRoutes.map(routeToMetadata)
}
