#!/usr/bin/env bun
import { existsSync, rmSync } from "node:fs"
import { join } from "node:path"
import net from "node:net"

// Guards the dev build cache against the recurring Next.js corruption where a
// `'use client'` component resolves to `undefined` ("Element type is invalid"
// / "recentlyCreatedOwnerStacks"). Both come from a `.next/dev` left in a bad
// state by an unclean shutdown (crash, SIGTERM, or a second concurrent server).
// This runs BEFORE `next dev` binds the port, so a present lock with a free
// port means the previous server died dirty -> wipe and rebuild clean.

const rootDir = process.cwd()
const devDir = join(rootDir, ".next", "dev")
const routesManifest = join(devDir, "routes-manifest.json")
const lockFile = join(devDir, "lock")
const devPort = Number(process.env.PORT) || 3000

function _is_incomplete() {
  return existsSync(devDir) && !existsSync(routesManifest)
}

function _close_sock(socket, result) {
  socket.destroy()
  return result
}

function _probe_port(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" })
    socket.once("connect", () => resolve(_close_sock(socket, true)))
    socket.once("error", () => resolve(false))
    socket.setTimeout(400, () => resolve(_close_sock(socket, false)))
  })
}

async function _has_stale_lock() {
  if (!existsSync(lockFile)) return false
  const live = await _probe_port(devPort)
  return !live
}

function _rm_dev_cache(reason) {
  rmSync(devDir, { recursive: true, force: true })
  console.log(`prepare-dev-cache: removed .next/dev cache (${reason})`)
}

async function _run_guard() {
  if (_is_incomplete()) _rm_dev_cache("incomplete build")
  else if (await _has_stale_lock()) _rm_dev_cache("stale lock from prior crash")
}

await _run_guard()
