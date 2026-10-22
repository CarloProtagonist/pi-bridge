'use strict';
/**
 * gpu.js — GPU-priority claim for the shared 16 GB GPU (bidirectional,
 * approach A). pi-bridge's `qwen27` lives in Ollama; conscience's 35B MoE is
 * a llama-server under `conscience-serve`. Whoever got the *newest* prompt
 * should own the card.
 *
 * Signal = a fresh-timestamp CLAIM FILE (mtime = the claim), mirroring the
 * `conscience.busy` pattern the two services already share. pi-bridge writes
 * its file on every user prompt; the conscience manager (the sole arbiter —
 * it owns llama-server and the Ollama `evict()` helper) reads both claim
 * files and steers VRAM to the newest owner. No new daemon, no HTTP, no
 * token handshake; a stale file on a crashed process simply reads old and
 * loses fairly.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Default to the conscience `log/` dir — the arbiter (conscience-serve's
// manager) already lives there and reads every claim file from it. All GPU
// arbiters inputs share one dir: log/conscience.busy, log/pi-bridge.claim.
// Overridable (env or arg) for tests.
function defaultClaimFile() {
  return process.env.GPU_CLAIM_FILE
    || path.join(os.homedir(), 'conscience', 'log', 'pi-bridge.claim');
}

/**
 * Stamp this side of the GPU as "just used, I want the card now".
 * `claimGpu()` = now; `claimGpu(ts)` = a historical claim (tests).
 * Writes into the shared conscience `log/` dir so the manager can read it.
 * Non-fatal: a write failure must never break a user's prompt.
 * Returns the ms-epoch we wrote.
 */
function claimGpu(ts, file) {
  const t = ts ? new Date(ts) : new Date();
  const p = file || defaultClaimFile();
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, String(t.toISOString()) + '\n');
    try { fs.utimesSync(p, t, t); } catch {} // pin mtime to the claim time
  } catch (e) {
    console.error('[gpu] claim write failed: ' + String(e.message || e));
  }
  return t.getTime();
}

/** Claim-file path, exposed for the manager/tests to locate it. */
function claimFile() { return defaultClaimFile(); }

module.exports = { claimGpu, claimFile };
