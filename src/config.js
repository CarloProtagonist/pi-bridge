'use strict';
/**
 * config.js — every tunable in one place.
 *
 * Parses the CLI (`node server.js [--port n] [--host H] [--token T] [piExtraArgs]`)
 * and the env vars, resolves default file paths under ~/.config/pibridge, and
 * exposes them as a single read-only `CFG` object that all other modules import.
 *
 * Keeping the argv/env surface here means the rest of the source never touches
 * process.argv or process.env directly.
 */
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');

const ARGS = process.argv.slice(2);

// --port / --host / --token are pi-bridge's own; anything else is forwarded
// straight through to the `pi --mode rpc` child (e.g. --model, a system-prompt
// file, an extension path). See src/agent.js#startProcess.
const extraArgs = [];
let port = 8787,
    host = 'AUTO',
    cliToken = null;
for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === '--port') { port = Number(ARGS[i + 1]); i++; }
  else if (ARGS[i] === '--host') { host = ARGS[i + 1]; i++; }
  else if (ARGS[i] === '--token') { cliToken = ARGS[i + 1]; i++; }
  else extraArgs.push(ARGS[i]);
}

const HOME = os.homedir();

const CFG = {
  // The agent binary. Set PI_BIN to point at a specific `pi` build; defaults to
  // whatever `pi` resolves to on PATH.
  piBin: process.env.PI_BIN || 'pi',
  // The directory the agent runs in. Its cwd determines which `~/.pi/agent/sessions/<dir>`
  // bucket the conversation lands in, so keep this stable across restarts if you want
  // history to keep accumulating in one place.
  cwd: process.env.PIBRIDGE_CWD || process.cwd(),

  home: HOME,
  port,
  host,
  cliToken,
  extraArgs,

  // All mutable runtime state lives under one dir so it's easy to back up /
  // wipe / inspect.
  cfgDir: path.join(HOME, '.config', 'pibridge'),
  tokenFile: path.join(HOME, '.config', 'pibridge', 'token'),
  vapidFile: path.join(HOME, '.config', 'pibridge', 'vapid.json'),
  subsFile: path.join(HOME, '.config/pibridge/push-subscriptions.json'),
  templatesFile: path.join(HOME, '.config/pibridge/templates.json'),
  accessLog: path.join(__dirname, '..', 'access.log'),
  diagLog: path.join(__dirname, '..', 'diag.log'),
  rpcLog: path.join(__dirname, '..', 'rpc.log'),

  // Where `pi` keeps its session transcripts (`.jsonl`). Follow mode tails the
  // newest one and pushes a notification whenever the PC agent starts/finishes
  // a turn.
  sessionsDir: path.join(HOME, '.pi', 'agent', 'sessions'),

  // Optional HTTPS (Web Push requires a secure origin). Provide PEM files via
  // env; when absent the bridge serves plain HTTP and push is unavailable.
  httpsPort: Number(process.env.PIBRIDGE_HTTPS_PORT || 8443),
  cert: process.env.PIBRIDGE_CERT || null,
  key: process.env.PIBRIDGE_KEY || null,
  forceHttpNotice: Boolean(process.env.PIBRIDGE_HTTPS),

  // Self-hosted ntfy (see ntfy.sh) — used for phone push + the "Test button".
  ntfyUrl: 'http://127.0.0.1:3333/pibridge',
  ntfyTokenFile: path.join(HOME, '.local', 'share', 'ntfy-pibridge', 'access-token'),

  // Loop tuning.
  pollTimeoutMs: 45000,   // /api/poll: close the client if no events arrive for this long.
  maxEvents: 500,         // how many recent events /api/poll replays to a re-joining client.
  heartbeatMs: 15000,     // how often /api/poll emits a `: hb` comment (keeps proxies from timing us out).
  stallMs: 90000,         // how long follow mode waits with an open turn before announcing "stuck mid-turn?".
};

// ---------------------------------------------------------------- network
/** The machine's private Tailscale IP (100.x), or null if tailscale is down. */
function tailnetIp() {
  try {
    const out = execSync('tailscale ip -4', { encoding: 'utf8' }).trim();
    if (/^100\.\d+\.\d+\.\d+$/.test(out)) return out;
  } catch {}
  return null;
}
/** Tailscale PeerName (the stable `*.ts.net` hostname), or null. */
function tailnetName() {
  try {
    const sj = JSON.parse(execSync('tailscale status --json', { encoding: 'utf8' }));
    return (sj.Self || {}).PeerName || null;
  } catch {
    return null;
  }
}
/**
 * Which interface the HTTP listener binds to. "AUTO" (the default) binds
 * 0.0.0.0 so the bridge is reachable on every address the box owns — LAN and
 * Tailscale alike. The API is still fully token-gated, and the static UI is
 * public by design (it is just a shell; it does nothing without the token).
 */
function pickHost() {
  if (host !== 'AUTO') return host;
  const t = tailnetIp();
  console.error(`[pibridge] binding 0.0.0.0 (tailscale: ${t || 'down'}; token gates the API)`);
  return '0.0.0.0';
}

module.exports = {
  CFG,
  tailnetIp,
  tailnetName,
  pickHost,
};
