import { fileURLToPath } from "node:url"
import path from "node:path"
import { defineConfig } from "vitest/config"

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
  coverage: {
    provider: "v8" as const,
    reportsDirectory: coverageReportsDirectory,
    reporter: ["text", "lcov"],
    thresholds: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
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
