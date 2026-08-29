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
  // times of 150s+ there vs <1s locally) — raised once to 20000ms so a
  // slow-but-fine test doesn't flake, while still catching genuine hangs.
  // 2026-08-29: still flaked at 20000ms on Vercel (tests/integration/
  // telemetry-route.test.ts > "returns 400 for invalid body" — a synchronous,
  // no-I/O test with nothing to actually hang on; the failure was purely
  // build-machine scheduling contention under the coverage-instrumented run).
  // Raised again with more headroom.
  testTimeout: 45000,
  hookTimeout: 45000,
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
      // Thin admin UI shells; auth/API logic is covered in unit/integration tests.
      "**/app/admin/**",
      "**/components/admin/**",
      // Consent-gated client beacon; covered via /api/telemetry contract tests.
      "**/components/site-telemetry.tsx",
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
