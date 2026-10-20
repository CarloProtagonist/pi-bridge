'use strict';
/**
 * sessions.js — read-only access to `pi`'s session transcripts.
 *
 * Layout:  ~/.pi/agent/sessions/<projectDir>/<timestamp>-<session>.jsonl
 * where <projectDir> is a dash-encoded form of the project's cwd. Each
 * transcript is JSONL; the records we care about are the {type:"message"}
 * lines (role user / assistant / toolResult / system), plus "compaction"
 * markers. Everything here is bounded to the most recent ~256 KiB–2 MiB of
 * any file — a 4 GB session file takes milliseconds to scan the head/tail of,
 * and a full-file scan is never needed for display.
 *
 * No mutations happen in here: deletion goes through the API (which calls
 * resolveSession() first for the same path-traversal guard).
 */
const fs = require('node:fs');
const path = require('node:path');
const { CFG } = require('./config.js');

const SESSIONS_DIR = CFG.sessionsDir;

/**
 * Map a session UUID to a "<projectDir>/<file>.jsonl" relative path by scanning
 * every project subdirectory (the only way to find "which file belongs to this
 * active session"). Returns null when not found.
 */
function filenameForSessionId(id) {
  if (!id) return null;
  const suf = '_' + id + '.jsonl';
  try {
    for (const d of fs.readdirSync(SESSIONS_DIR)) {
      try {
        for (const f of fs.readdirSync(path.join(SESSIONS_DIR, d))) {
          if (f.endsWith(suf)) return d + '/' + f;
        }
      } catch {}
    }
  } catch {}
  return null;
}

/** Best-effort display only: decode a dash-encoded project dir into a path. */
function decodeProject(d) {
  let out = String(d);
  if (out.startsWith('--')) out = out.slice(2);   // leading "/"
  if (out.endsWith('--')) out = out.slice(0, -2); // trailing
  return '/' + out.replace(/-/g, '/');
}

/**
 * Guarded path join: "projectDir/file.jsonl" → absolute path under
 * SESSIONS_DIR, or null if it would escape (any ".." segment), if the target
 * doesn't exist, or if it isn't a regular file.
 */
function resolveSession(rel) {
  if (!rel || rel.includes('..')) return null;
  const clean = String(rel).replace(/^\/+/, '');
  const full = path.join(SESSIONS_DIR, clean);
  if (!full.startsWith(SESSIONS_DIR + path.sep)) return null;
  try { if (!fs.statSync(full).isFile()) return null; } catch { return null; }
  return full;
}

/** First non-system user message → a short title (max 60 chars). */
function titleOfFile(full) {
  try {
    const sz = fs.statSync(full).size;
    const fd = fs.openSync(full, 'r');
    const n = Math.min(sz, 256 * 1024);
    const buf = Buffer.alloc(n);
    fs.readSync(fd, buf, 0, n, 0);
    fs.closeSync(fd);
    for (const line of buf.slice(0, n).toString('utf8').split('\n')) {
      if (!line.trim()) continue;
      let e;
      try { e = JSON.parse(line); } catch { continue; }
      if (e.type === 'message' && e.message && e.message.role === 'user') {
        const t = (e.message.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(' ');
        if (t && !t.startsWith('<system')) return t.replace(/\s+/g, ' ').slice(0, 60);
      }
    }
  } catch {}
  return null;
}

/**
 * Per-project session metadata for the "Sessions" tab:
 *   [{ file, project, title, size, mtime, firstTs }]  (newest mtime first)
 */
function readHead() {
  const out = [];
  let dirs = [];
  try { dirs = fs.readdirSync(SESSIONS_DIR); } catch { return out; }
  for (const d of dirs) {
    const proj = decodeProject(d);
    let files = [];
    try { files = fs.readdirSync(path.join(SESSIONS_DIR, d)); } catch { continue; }
    for (const f of files) {
      if (!/\d{4}-\d{2}-\d{2}T.*\.jsonl$/.test(f)) continue;
      const full = path.join(SESSIONS_DIR, d, f);
      let st;
      try { st = fs.statSync(full); } catch { continue; }
      let title = null,
          firstTs = null;
      try {
        const fd = fs.openSync(full, 'r');
        const buf = Buffer.alloc(Math.min(st.size, 256 * 1024));
        const n = fs.readSync(fd, buf, 0, buf.length, 0);
        fs.closeSync(fd);
        for (const line of buf.slice(0, n).toString('utf8').split('\n')) {
          if (!line.trim()) continue;
          let e;
          try { e = JSON.parse(line); } catch { continue; }
          if (!firstTs && e.timestamp) firstTs = e.timestamp;
          if (e.type === 'message' && e.message && e.message.role === 'user') {
            const t = (e.message.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(' ');
            if (t && !t.startsWith('<system')) {
              title = t.replace(/\s+/g, ' ').trim();
              break;
            }
          }
        }
      } catch {}
      out.push({
        file: d + '/' + f,
        project: proj,
        title: title || '(no content yet)',
        size: st.size,
        mtime: st.mtimeMs,
        firstTs,
      });
    }
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

/**
 * One pass over a jsonl chunk, calling cb() once per *displayable* message.
 * Skips tool results and system messages; folds tool calls into
 * `tools: [name, ...]` and thinking into a truncated `thinking`.
 */
function iterMessages(chunk, cb) {
  for (const line of chunk.split('\n')) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.type === 'compaction') {
      const sum = e.summary || e.text || '';
      if (sum) cb({ role: 'info', text: '⟲ context compacted: ' + String(sum).slice(0, 160), ts: e.timestamp });
      continue;
    }
    if (e.type !== 'message' || !e.message) continue;
    const m = e.message;
    if (m.role === 'system' || m.role === 'toolResult') continue;
    const ts = e.timestamp || m.timestamp;
    if (m.role === 'user') {
      const t = (m.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
      if (t && !t.startsWith('<system')) cb({ role: 'user', text: t.slice(0, 8000), ts });
      continue;
    }
    if (m.role === 'assistant') {
      let thinking = '',
          text = '';
      const tools = [];
      for (const c of m.content || []) {
        if (c.type === 'thinking' && c.thinking) thinking += c.thinking;
        else if (c.type === 'toolCall') tools.push(c.name || c.toolName || 'tool');
        else if (c.type === 'text') text += c.text;
      }
      text = text.trim();
      if (!text && !thinking) continue;
      cb({
        role: 'assistant',
        text: text.slice(0, 30000),
        tools: tools.length ? tools.slice(0, 40) : undefined,
        thinking: thinking.slice(0, 400) + (thinking.length > 400 ? ' …' : ''),
        ts,
      });
    }
  }
}

/**
 * Decode the trailing ~2 MiB of a session file into display messages (last up
 * to o.maxMsgs of them, default 250). Reading a bounded window — not the whole
 * file — is what keeps opening a multi-GB session O(1).
 */
function parseSessionMessages(rel, o = {}) {
  const full = resolveSession(rel);
  if (!full) return null;
  const MAX = 4 * 1024 * 1024;
  const sz = fs.statSync(full).size;
  const off = Math.max(0, sz - MAX);
  const fd = fs.openSync(full, 'r');
  const len = sz - off;
  const buf = Buffer.alloc(len + 64);
  const n = fs.readSync(fd, buf, 0, len + 64, off);
  fs.closeSync(fd);
  let s2 = buf.slice(0, n).toString('utf8');
  if (off > 0) {
    const i = s2.indexOf('\n');
    if (i >= 0) s2 = s2.slice(i + 1); // first partial line would be garbage if we kept it
  }
  const out = [];
  iterMessages(s2, (m) => out.push(m));
  return out.slice(-Math.max(1, parseInt(o.maxMsgs || 250, 10)));
}

/**
 * Open work units = user prompts sent − assistant text replies produced.
 * A streaming session has more prompts than responses while the agent is
 * mid-turn, and returns to equilibrium the moment it finishes. That diff —
 * not file size, not "last line is an assistant" — is what follow mode uses
 * to decide "done, needs your input".
 */
function scanDepth(full) {
  let off = 0;
  const sz = fs.statSync(full).size;
  const fd = fs.openSync(full, 'r');
  let users = 0,
      atext = 0,
      carry = '';
  for (;;) {
    const len = Math.min(1024 * 1024, sz - off);
    if (len <= 0) break;
    const buf = Buffer.alloc(len);
    const n = fs.readSync(fd, buf, 0, len, off);
    off += n;
    let s3 = carry + buf.slice(0, n).toString('utf8');
    carry = '';
    const li = s3.lastIndexOf('\n');
    if (li < 0) {
      carry = s3;
      continue;
    }
    carry = s3.slice(li + 1);
    s3 = s3.slice(0, li + 1);
    for (const line of s3.split('\n')) {
      if (!line.includes('"message"')) continue;
      let e;
      try { e = JSON.parse(line); } catch { continue; }
      if (e.type !== 'message' || !e.message) continue;
      if (e.message.role === 'user' && (e.message.content || []).some((c) => c.type === 'text' && !c.text.startsWith('<system'))) users++;
      if (e.message.role === 'assistant' && (e.message.content || []).some((c) => c.type === 'text' && c.text.trim())) atext++;
    }
  }
  fs.closeSync(fd);
  return Math.max(0, users - atext);
}

module.exports = {
  SESSIONS_DIR,
  filenameForSessionId,
  decodeProject,
  resolveSession,
  titleOfFile,
  readHead,
  iterMessages,
  parseSessionMessages,
  scanDepth,
};
