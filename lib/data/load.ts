/**
 * Load and parse YAML files from data/. Node-only (build/SSR).
 * Do not import this from client-only code.
 */
import fs from "fs"
import path from "path"
import YAML from "yaml"

const DATA_DIR = "data"

function getDataPath(filename: string): string {
  return path.join(process.cwd(), DATA_DIR, filename)
}

export function loadYaml<T>(filename: string): T {
  const filePath = getDataPath(filename)
  const raw = fs.readFileSync(filePath, "utf-8")
  return YAML.parse(raw) as T
}
