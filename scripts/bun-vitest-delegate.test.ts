import { expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

test("Vitest full suite (tests/**/*.test.{ts,tsx})", () => {
  const result = spawnSync("bunx", ["vitest", "run"], {
    cwd: projectRoot,
    stdio: "inherit",
  })
  expect(result.status).toBe(0)
}, 600_000)
