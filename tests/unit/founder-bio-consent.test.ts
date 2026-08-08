/**
 * Third-party consent guardrail (owner relay 2026-08-08).
 *
 * Will Lupfer's father declined to be referenced on the site, Nike included:
 *   "Don't put my bio up rn"
 *   "My dad doesn't want him or Nike mentioned"
 *
 * The AUG 8 restructure design file's founder bio carries exactly this material
 * — a 20-year Nike tenure, Phil Knight as the LUPFR blueprint, and a "Nike had
 * Just Do It" parallel. That bio is otherwise a natural thing to port verbatim,
 * which is precisely why this guard exists: a future session reading the design
 * file has no way to know about a refusal delivered over iMessage.
 *
 * This is a named living person's withheld consent, not a style preference.
 * See docs/REQUIREMENTS.md → "Third-party consent". Remove only on an explicit
 * owner instruction recorded in docs/CHANGELOG.md.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

/** Shipped copy surfaces. Excludes docs/ — the requirement itself names the terms. */
const SEARCH_DIRS = ["data", "components", "app", "lib"]
const TEXT_EXT = new Set([".ts", ".tsx", ".yml", ".yaml", ".json", ".md", ".mdx"])

/**
 * Each term is paired with why it is barred, so a failure explains itself
 * instead of looking like an arbitrary banned-word list.
 */
const BARRED: Array<{ pattern: RegExp; why: string }> = [
  { pattern: /\bnike\b/i, why: "Will's father's employer — he declined the mention" },
  { pattern: /\bphil\s+knight\b/i, why: "Nike founder, cited via the father's tenure" },
  { pattern: /just\s+do\s+it/i, why: "Nike slogan used in the embargoed bio's parallel" },
  { pattern: /\b(his|will'?s)\s+(dad|father)\b/i, why: "direct reference to Will's father" },
]

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "generated") {
        // `generated/` is derived from data/, which is already scanned.
        if (entry.name === "node_modules") continue
      }
      yield* walk(full)
    } else if (TEXT_EXT.has(path.extname(entry.name))) {
      yield full
    }
  }
}

describe("founder bio third-party consent guardrail", () => {
  const files = SEARCH_DIRS.flatMap((d) => [...walk(path.join(rootDir, d))])

  it("scans a non-trivial number of shipped copy files", () => {
    // Guards the guard: a broken walk would make every assertion below vacuous.
    expect(files.length).toBeGreaterThan(50)
  })

  for (const { pattern, why } of BARRED) {
    it(`never ships copy matching ${pattern} (${why})`, () => {
      const hits = files
        .filter((f) => pattern.test(fs.readFileSync(f, "utf8")))
        .map((f) => path.relative(rootDir, f))

      expect(
        hits,
        `Barred reference found (${why}). Will Lupfer's father declined this ` +
          `mention on 2026-08-08; see docs/REQUIREMENTS.md → Third-party consent.`
      ).toEqual([])
    })
  }
})
