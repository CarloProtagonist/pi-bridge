'use strict';
/**
 * auth.js — the shared secret that gates the whole API.
 *
 * The token is printed at first run and persisted to ~/.config/pibridge/token.
 * Clients send it as either `?token=...` in the URL or as
 * `Authorization: Bearer <token>`. Everything under /api/ rejects anything
 * that does not match (timing-safe), except a small allow-list:
 *   /api/health          — liveness probe (exposes publicState() only)
 *   /api/push/vapid-key  — public VAPID key; needed by the browser *before* it
 *                           has been challenged with a token.
 *   /api/diag            — unauthenticated POST of client-side diagnostic info.
 *
 * The token itself is never written to the access log (it would leak into a
 * file any local user can read).
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { CFG } = require('./config');

function loadOrCreateToken() {
  // A token passed on the command line always wins (useful for testing / one-off runs).
  if (CFG.cliToken) return CFG.cliToken;
  try {
    const t = fs.readFileSync(CFG.tokenFile, 'utf8').trim();
    if (t.length >= 16) return t;
  } catch {}
  const t = crypto.randomBytes(24).toString('hex');
  fs.mkdirSync(path.dirname(CFG.tokenFile), { recursive: true });
  fs.writeFileSync(CFG.tokenFile, t + '\n', { mode: 0o600 });
  console.error(`[pibridge] wrote new token to ${CFG.tokenFile}`);
  return t;
}

const TOKEN = loadOrCreateToken();

function isAuthed(req, url) {
  const a =
    url.searchParams.get('token') ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return (
    typeof a === 'string' &&
    a.length >= 16 &&
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(TOKEN))
  );
}

/** Endpoints under /api/ that do not require the shared token. */
const PUBLIC_API = new Set(['/api/health', '/api/push/vapid-key', '/api/diag']);

module.exports = {
  TOKEN,
  isAuthed,
  PUBLIC_API,
};
