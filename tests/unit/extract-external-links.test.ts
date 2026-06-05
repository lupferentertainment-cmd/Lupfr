import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const scriptPath = path.join(rootDir, "scripts", "extract-external-links.mjs")

const FIXTURE_HTML = `<!doctype html>
<html>
  <body>
    <a href="/gallery">Internal route</a>
    <a href="https://www.instagram.com/lupfr_/">Instagram</a>
    <a href="https://www.tiktok.com/@lupfer_entertainment#follow">TikTok with fragment</a>
    <a href="https://www.instagram.com/lupfr_/">Instagram duplicate</a>
    <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Flupfr.com%2Fgallery%2Fp%2F10&text=One">Share one</a>
    <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Flupfr.com%2Fgallery%2Fp%2F11&text=Two">Share two</a>
    <a href="mailto:hello@example.com">Email</a>
    <a href="tel:+15555550100">Phone</a>
    <a href="http://localhost:3000/local">Local host</a>
    <link rel="canonical" href="https://lupfr.com/" />
  </body>
</html>`

let fixturePath = ""
let output: readonly string[] = []

function runExtractor(htmlFile: string): string[] {
    const stdout = execFileSync("bun", [scriptPath, htmlFile], { encoding: "utf8" })
    return stdout.split("\n").filter((line) => line.length > 0)
}

beforeAll(() => {
    fixturePath = path.join(os.tmpdir(), `lupfr-external-links-${process.pid}.html`)
    fs.writeFileSync(fixturePath, FIXTURE_HTML, "utf8")
    output = runExtractor(fixturePath)
})

afterAll(() => {
    if (fixturePath && fs.existsSync(fixturePath)) {
        fs.rmSync(fixturePath)
    }
})

describe("extract-external-links", () => {
    it("emits external anchor destinations", () => {
        expect(output).toContain("https://www.instagram.com/lupfr_/")
    })

    it("strips URL fragments before emitting", () => {
        expect(output).toContain("https://www.tiktok.com/@lupfer_entertainment")
    })

    it("deduplicates repeated external links", () => {
        expect(output.filter((url) => url === "https://www.instagram.com/lupfr_/")).toHaveLength(1)
    })

    it("collapses repeated social share endpoints", () => {
        expect(output.filter((url) => url === "https://twitter.com/intent/tweet")).toHaveLength(1)
    })

    it("excludes internal relative routes", () => {
        expect(output.some((url) => url.includes("/gallery"))).toBe(false)
    })

    it("excludes mailto links", () => {
        expect(output.some((url) => url.startsWith("mailto:"))).toBe(false)
    })

    it("excludes tel links", () => {
        expect(output.some((url) => url.startsWith("tel:"))).toBe(false)
    })

    it("excludes localhost destinations", () => {
        expect(output.some((url) => url.includes("localhost"))).toBe(false)
    })

    it("excludes non-anchor link elements", () => {
        expect(output.some((url) => url === "https://lupfr.com/")).toBe(false)
    })
})
