'use strict';
/**
 * follow.js — "watch what the PC agent is doing, tell me when it needs me".
 *
 * Every 1.5 s it re-reads the most recent bytes of the PC's active session
 * .jsonl (the tail after its last-read offset), counts new user/assistant
 * messages, and fires a notification on every state transition:
 *
 *     ┌─── new user prompt ──────── "→ working"       (depth 0 → 1)
 *     └─── agent finished a turn ── "→ needs your input" (depth 1 → 0)
 *
 * The depth heuristic (user prompts sent − assistant replies produced) is what
 * tells us "turn done" — not "last line is an assistant" (compaction can emit a
 * user-looking marker after it, and a mid-stream crash leaves the same shape).
 *
 * `follow.file`/`follow.off`/`follow.busy` etc. are read by publicState(), so
 * this module has to own the live state object that the /api/* handlers and
 * the agent's publicState() both read from. index.js wires the notification
 * callback and calls autoFollow() to (re)point follow at the PC's active
 * transcript whenever pi picks up a new one.
 */
const fs = require('node:fs');
const { CFG } = require('./config.js');
const S = require('./sessions.js');

/**
 * Create the follow controller.
 * @param {object} deps
 *   deps.onNotif(title, text) — called on every transition.
 *   deps.filenameForSessionId(id) — id → "<proj>/<file>.jsonl" | null.
 */
function createFollow({ onNotif, filenameForSessionId }) {
  const follow = {
    on: false,
    file: null,
    proj: null,
    off: 0,
    depth: 0,
    busy: false,
    lastReply: '',
    msgs: [],
    timer: null,
    note: '',
    startedAt: 0,
    ongoing: false,
    // per-turn liveness, used by the "stuck mid-turn?" probe:
    lastActivity: 0,
    stallNotified: false,
  };

  /** Live state exposed to /api/state + /api/sessions. */
  function publicFollow() {
    let nm;
    try {
      nm = follow.on ? S.titleOfFile(S.resolveSession(follow.file)) : null;
    } catch {
      nm = null;
    }
    return {
      on: follow.on,
      file: follow.file,
      project: follow.proj,
      busy: follow.busy,
      name: nm,
      ongoing: follow.ongoing,
      depth: follow.depth,
      lastReply: follow.lastReply.slice(-300),
      msgs: follow.msgs.slice(-12),
      sinceMin: follow.on ? Math.round((Date.now() - follow.startedAt) / 60000) : 0,
    };
  }

  /** Stop watching (and clear the timer). */
  function stopFollow(note) {
    if (follow.timer) clearInterval(follow.timer);
    follow.timer = null;
    follow.on = false;
    follow.busy = false;
    follow.note = note || '';
  }

  /**
   * Start (re)watching a transcript.
   * @param {string} rel   "<projDir>/<file>.jsonl"
   * @param {boolean} ongoing  keep watching past one turn (PC-follow mode)
   */
  function startFollow(rel, ongoing) {
    const full = S.resolveSession(rel);
    if (!full) return { error: 'bad session file' };
    stopFollow();
    follow.on = true;
    follow.file = rel;
    follow.proj = S.decodeProject(rel.split('/')[0]);
    follow.off = 0;
    follow.depth = S.scanDepth(full); // count what's already there so we don't announce old prompts
    follow.busy = follow.depth > 0;
    // Seed the last few messages in the {r,t,ts} shape the UI's mirror expects
    // (parseSessionMessages yields {role,text} — map only the transcript rows).
    follow.msgs = (S.parseSessionMessages(rel, { maxMsgs: 30 }) || [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.text)
      .map((m) => ({ r: m.role === 'user' ? 'you' : 'pi', t: m.text.slice(0, 300), ts: m.ts }))
      .slice(-12);
    follow.lastReply = follow.msgs.length ? follow.msgs[follow.msgs.length - 1].t : '';
    follow.ongoing = !!ongoing;
    follow.note = '';
    follow.startedAt = Date.now();
    follow.lastActivity = Date.now();
    follow.stallNotified = false;
    // Read from the very end of the file so we only report *new* traffic.
    follow.off = fs.statSync(full).size;
    follow.timer = setInterval(tickFollow, 1500);
    return publicFollow();
  }

  /**
   * Poll the tailed file for new bytes. Reads only the chunk past follow.off
   * and only up to the last *complete* line (a partial trailing line is dropped
   * and re-read next tick once its newline lands).
   */
  function tickFollow() {
    if (!follow.on) return;
    const full = S.resolveSession(follow.file);
    if (!full) {
      stopFollow('PC session file vanished');
      onNotif('pi (PC) — follow ended', 'The session file disappeared (closed or renamed).');
      return;
    }
    let st;
    try {
      st = fs.statSync(full);
    } catch {
      return;
    }
    if (st.size < follow.off) follow.off = 0; // file rewound / rotated
    if (st.size === follow.off) {
      // No new bytes — but this is our chance to detect "turn stuck".
      if (
        follow.busy &&
        follow.depth > 0 &&
        !follow.stallNotified &&
        Date.now() - follow.lastActivity > CFG.stallMs
      ) {
        follow.stallNotified = true;
        onNotif('pi (PC) → stuck mid-turn?', 'Open prompt, no new output for ' + Math.round((Date.now() - follow.lastActivity) / 1000) + 's. Check the session.');
      }
      return;
    }
    const fd = fs.openSync(full, 'r');
    const len = st.size - follow.off;
    const buf = Buffer.alloc(len + 64);
    const n = fs.readSync(fd, buf, 0, len + 64, follow.off);
    fs.closeSync(fd);
    let s = buf.slice(0, n).toString('utf8');
    const li = s.lastIndexOf('\n');
    if (li < 0) return; // wait for a full line
    s = s.slice(0, li + 1);
    follow.off += li + 1;

    let userNew = 0;
    let asstText = 0;
    let lastUser = null;
    S.iterMessages(s, (m) => {
      if (m.role === 'user') {
        userNew++;
        lastUser = m.text;
        follow.msgs.push({ r: 'you', t: m.text.slice(0, 200), ts: m.ts });
      } else if (m.role === 'assistant' && m.text) {
        asstText++;
        follow.msgs.push({ r: 'pi', t: m.text.slice(0, 300), ts: m.ts });
      }
    });
    if (userNew || asstText) {
      follow.lastActivity = Date.now();
      follow.stallNotified = false;
    }
    if (follow.msgs.length > 30) follow.msgs.splice(0, follow.msgs.length - 30);
    if (asstText && follow.msgs.length) follow.lastReply = follow.msgs[follow.msgs.length - 1].t;

    const before = follow.depth;
    follow.depth = Math.max(0, follow.depth + userNew - asstText);

    // Notifications are intentionally NOT fired here. Per the 2026-10-21 spec the
    // only push is "model went idle / turn complete", which is detected reliably in
    // src/agent.js from the live RPC `isStreaming` flag (file-based depth is not —
    // see scanDepth note in sessions.js). `before` is kept only to power the
    // one-shot auto-stop below.
    if (userNew && before === 0) follow.busy = true;
    if (follow.busy && before > 0 && follow.depth === 0) {
      const keepWatching = follow.ongoing;
      follow.busy = false;
      if (!keepWatching) stopFollow(); // one-shot: follow was for a single turn
    }
  }

  /**
   * Point follow at the PC's *active* transcript. Called from index.js on a
   * timer; cheap no-op unless the active session changed.
   */
  function autoFollow(activeSessionId) {
    if (!activeSessionId) return;
    // Already watching this exact file? Nothing to do.
    if (follow.on && follow.file && follow.file.endsWith('_' + activeSessionId + '.jsonl')) return;
    const f = filenameForSessionId(activeSessionId);
    if (!f) return;
    startFollow(f, true);
  }

  return { follow, publicFollow, startFollow, stopFollow, autoFollow };
}

module.exports = { createFollow };
