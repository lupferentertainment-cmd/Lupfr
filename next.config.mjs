import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = process.env.NEXT_DIST_DIR
const PAGES_MANIFEST = "pages-manifest.json"
const TRACE_MANIFEST = '{"version":1,"files":[]}\n'

class EmptyPagesManifestPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("EmptyPagesManifestPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "EmptyPagesManifestPlugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => emitFallbackAssets(compilation, compiler.webpack.sources.RawSource),
      )
    })
    compiler.hooks.afterEmit.tap("EmptyPagesManifestPlugin", () => {
      writePagesManifest(compiler.outputPath)
      writeTraceManifests(compiler.outputPath)
    })
  }
}

function emitFallbackAssets(compilation, RawSource) {
  emitMissingAsset(compilation, RawSource, PAGES_MANIFEST, "{}\n")
  for (const assetName of Object.keys(compilation.assets)) {
    emitTraceAsset(compilation, RawSource, assetName)
  }
}

function emitTraceAsset(compilation, RawSource, assetName) {
  if (!assetName.endsWith(".js")) return
  if (assetName.includes("/")) return
  emitMissingAsset(compilation, RawSource, `${assetName}.nft.json`, TRACE_MANIFEST)
}

function emitMissingAsset(compilation, RawSource, assetName, content) {
  if (compilation.getAsset(assetName)) return
  compilation.emitAsset(assetName, new RawSource(content))
}

function writePagesManifest(outputPath) {
  const manifestPath = path.join(outputPath, PAGES_MANIFEST)
  if (fs.existsSync(manifestPath)) return
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  fs.writeFileSync(manifestPath, "{}\n")
}

function writeTraceManifests(outputPath) {
  for (const filePath of findServerJsFiles(outputPath)) {
    const tracePath = `${filePath}.nft.json`
    if (!fs.existsSync(tracePath)) fs.writeFileSync(tracePath, TRACE_MANIFEST)
  }
}

function findServerJsFiles(outputPath) {
  if (!fs.existsSync(outputPath)) return []
  const pending = [outputPath]
  const files = []
  while (pending.length > 0) {
    collectServerJsPath(pending.pop(), pending, files)
  }
  return files
}

function collectServerJsPath(entryPath, pending, files) {
  const stat = fs.statSync(entryPath)
  if (stat.isDirectory()) return pushDirectoryEntries(entryPath, pending)
  if (entryPath.endsWith(".js")) files.push(entryPath)
}

function pushDirectoryEntries(dirPath, pending) {
  for (const name of fs.readdirSync(dirPath)) pending.push(path.join(dirPath, name))
}

function addPagesManifestGuard(config, isServer, dev) {
  if (isServer && !dev) config.plugins.push(new EmptyPagesManifestPlugin())
  return config
}

/**
 * @type {import('next').NextConfig}
 * Lighthouse: run against production (next build && next start) for minify/LCP metrics.
 */
const nextConfig = {
  ...(distDir ? { distDir } : {}),
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    cpus: 1,
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
  webpack(config, { dev, isServer }) {
    return addPagesManifestGuard(config, isServer, dev)
  },
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
  async headers() {
    return [
      {
        source: "/hero/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
}

export default nextConfig
