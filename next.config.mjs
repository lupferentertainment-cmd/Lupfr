import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @type {import('next').NextConfig}
 * Lighthouse: run against production (next build && next start) for minify/LCP metrics.
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    /** Literal HTTP 404 for unknown paths; required for `scripts/verify-routes.sh` missing-URL checks. */
    globalNotFound: true,
    inlineCss: true,
    imgOptTimeoutInSeconds: 30,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      'recharts',
      'framer-motion',
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  devIndicators: false,
  /**
   * Legacy URLs: on-disk album folder is `public/gallery/boiler_boat_003/`; older links used
   * `/gallery/boiler_boat/` or `/events/boiler_boat_003/...` for the same files.
   */
  async rewrites() {
    return [
      {
        source: "/events/boiler_boat_003/:path*",
        destination: "/gallery/boiler_boat_003/:path*",
      },
      {
        source: "/gallery/boiler_boat/:path*",
        destination: "/gallery/boiler_boat_003/:path*",
      },
      {
        source: "/gallery/where_is_west_004/:path*",
        destination: "/gallery/where_is_west/:path*",
      },
    ]
  },
}

export default nextConfig
