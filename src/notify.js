'use strict';
/**
 * notify.js — the "did the phone light up?" pipeline.
 *
 * Every interesting PC-agent transition (follow started/ended, a new prompt
 * arrived, the agent finished a turn and needs input, a suspected stall) is an
 * "addNotif":
 *   1. it lands in a small in-memory ring (NOTIFS) drained by GET /api/notify
 *      long-poll — that is what the *UI* (when open) uses to toast in place;
 *   2. it is published to self-hosted ntfy (see ntfy.sh);
 *   3. it is sent as a Web Push via src/push.js.
 *
 * The ntfy publish shells out to curl with the shared token read from disk at
 * call time (so rotating ~/.local/share/ntfy-pibridge/access-token works
 * without a server restart). A failed ntfy publish is logged, never fatal —
 * web push still reaches the phone.
 */
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { CFG } = require('./config');
// NOTE: web push is intentionally NOT wired into addNotif() (banners are off);
// the push module is still required by index.js for subscription hygiene endpoints.

// Every external child process this process has ever spawned (ntfy curl).
// Used as a weak set: the handler removes itself on "exit", so this only ever
// holds *live* handles — a leak of a finished process would show up here.
const CHILD_PROCS = new Set();

// Ring of recent notifications for the *open* UI's long-poll. Kept in memory:
// the authoritative "did it happen" record is the ntfy topic + the session
// .jsonl itself.
const NOTIFS = [];
const NOTIF_MAX = 50;

function ntfy(title, text) {
  try {
    const args = [
      '-s', '--max-time', '5', '-X', 'POST',
      CFG.ntfyUrl,
      '-H', 'Title: ' + String(title).slice(0, 180).replace(/\r|\n/g, ' '),
      '-H', 'Accept: application/json',
    ];
    try {
      args.push('-H', 'Authorization: Bearer ' + fs.readFileSync(CFG.ntfyTokenFile, 'utf8').trim());
    } catch {}
    args.push('-d', String(text || '').slice(0, 400));
    const c = spawn('curl', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.stderr.on('data', (d) => (out += d.toString()));
    CHILD_PROCS.add(c);
    c.on('error', (e) => {
      console.error('[pibridge] ntfy publish error:', e.message);
    });
    c.on('exit', (code) => {
      CHILD_PROCS.delete(c);
      if (code !== 0) console.error('[pibridge] ntfy publish failed (exit ' + code + '):', out.slice(0, 300));
    });
  } catch (e) {
    console.error('[pibridge] ntfy publish error:', e.message);
  }
}

/** Add one notification to every channel (UI ring + ntfy).
 *  Web Push is permanently OFF (user decision): no FCM fan-out here. Stale
 *  service workers on phones still registered from old builds would have
 *  shown banners for every push we sent, so the channel is cut at the head.
 *  Pushes are delivered to the phone via ntfy instead. */
function addNotif(title, text) {
  NOTIFS.push({
    at: Date.now(),
    title: String(title).slice(0, 200),
    text: String(text || '').slice(0, 300),
  });
  if (NOTIFS.length > NOTIF_MAX) NOTIFS.splice(0, NOTIFS.length - NOTIF_MAX);
  ntfy(title, text);
}

/**
 * GET /api/notify — long-poll until at least one notification is queued or
 * timeoutMs has elapsed. The UI's toast layer polls this in a loop.
 */
function waitNotify(res, timeoutMs, sendJson) {
  const end = Date.now() + timeoutMs;
  (function check() {
    if (NOTIFS.length) return sendJson(res, 200, { ok: true, n: NOTIFS.splice(0) });
    if (Date.now() >= end) return sendJson(res, 200, { ok: true, n: [] });
    setTimeout(check, 150);
  })();
}

module.exports = { NOTIFS, ntfy, addNotif, waitNotify, CHILD_PROCS };
