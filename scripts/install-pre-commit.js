#!/usr/bin/env node
"use strict";
// Installs scripts/pre-commit into .git/hooks/pre-commit so lint + build run before each commit.
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const source = path.join(repoRoot, "scripts", "pre-commit");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const target = path.join(hooksDir, "pre-commit");

try {
  if (!fs.existsSync(path.join(repoRoot, ".git"))) {
    process.exit(0);
  }
  const content = fs.readFileSync(source, "utf8");
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
  fs.writeFileSync(target, content, { mode: 0o755 });
} catch (e) {
  if (e.code === "ENOENT" && e.path === source) {
    process.exit(0);
  }
  console.error("Failed to install pre-commit hook:", e.message);
  process.exit(1);
}
