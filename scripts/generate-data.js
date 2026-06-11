/**
 * Build-time script: read data/*.yml and write lib/data/generated/*.json.
 * Run before next build so both server and client can import static JSON.
 */
const fs = require("fs")
const path = require("path")
const YAML = require("yaml")

const ROOT = path.join(__dirname, "..")
const DATA_DIR = path.join(ROOT, "data")
const OUT_DIR = path.join(ROOT, "lib", "data", "generated")

const files = ["events", "artists", "services", "partners", "gallery", "press", "careers"]

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

for (const name of files) {
  const src = path.join(DATA_DIR, `${name}.yml`)
  const dest = path.join(OUT_DIR, `${name}.json`)
  if (!fs.existsSync(src)) {
    console.warn(`generate-data: missing ${src}, skipping`)
    continue
  }
  const raw = fs.readFileSync(src, "utf-8")
  const data = YAML.parse(raw)
  fs.writeFileSync(dest, JSON.stringify(data, null, 2), "utf-8")
  console.log(`generate-data: ${name}.yml -> generated/${name}.json`)
}
