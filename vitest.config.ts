import { fileURLToPath } from "node:url"
import path from "node:path"
import { defineConfig } from "vitest/config"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const coverageReportsDirectory = process.env.VITEST_COVERAGE_DIR ?? "coverage"

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup/node-env-react.ts", "./tests/setup/rtl.ts"],
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environmentMatchGlobs: [["tests/**/*.test.tsx", "happy-dom"]],
    coverage: {
      provider: "v8",
      reportsDirectory: coverageReportsDirectory,
      reporter: ["text", "lcov"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
})
