import { fileURLToPath } from "node:url"
import path from "node:path"
import { defineConfig, coverageConfigDefaults } from "vitest/config"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const coverageReportsDirectory = process.env.VITEST_COVERAGE_DIR ?? "coverage"
const maxWorkers = process.env.VITEST_MAX_WORKERS ?? "50%"
const testConfig = {
  setupFiles: ["./tests/setup/node-env-react.ts", "./tests/setup/rtl.ts"],
  environment: "node" as const,
  globals: true,
  include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  environmentMatchGlobs: [["tests/**/*.test.tsx", "happy-dom"]],
  fileParallelism: true,
  maxWorkers,
  minWorkers: 1,
  // Vitest's 5000ms default is too thin a margin on Vercel's shared 2-core
  // build machine under transient load (observed cumulative transform/setup
  // times of 150s+ there vs <1s locally) — raised so a slow-but-fine test
  // doesn't flake, while still catching genuine hangs.
  testTimeout: 20000,
  hookTimeout: 20000,
  coverage: {
    provider: "v8" as const,
    reportsDirectory: coverageReportsDirectory,
    reporter: ["text", "lcov"],
    // Retired SEA//SIDE landing redirects to seaside.la; keep it out of the
    // global denominator so live LUPFR surfaces stay at the 90% bar.
    exclude: [
      ...coverageConfigDefaults.exclude,
      "**/components/seaside/**",
      "**/lib/data/generated/**",
    ],
    thresholds: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
}

export default defineConfig({
  test: testConfig,
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
})
