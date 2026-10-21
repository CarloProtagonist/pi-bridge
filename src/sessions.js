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
const TEMPLATES_DIR = CFG.templatesDir;

/**
 * The real working directory for one *encoded* pi session dir, read from the
 * `cwd` field of the first line of its first .jsonl (the authoritative source
 * — the dir-name encoding is lossy). null = cannot prove it's a directory / no
 * such project. Used to back "{project}" new-session and to label groups.
 *
 * `sessionsDir` is overridable for tests (defaults to CFG.sessionsDir).
 */
function agentResolveProject(dirName, sessionsDir) {
  const base = sessionsDir || SESSIONS_DIR;
  // dirName may be a bare encoded dir-name OR a full absolute path; we only
  // use its LAST path segment, which must be a non-dotted, non-empty basename
  // (so it can never be "."/".." or carry a separator).
  const seg = String(dirName || '').split('/').filter(Boolean).pop();
  if (!seg || seg === '.' || seg === '..' || seg.startsWith('.')) return null;
  const dd = path.join(base, seg);
  let files = [];
  try { files = fs.readdirSync(dd).filter((f) => f.endsWith('.jsonl')).sort(); } catch { return null; }
  for (const f of files) {
    try {
      const buf = Buffer.alloc(2048);
      const fd = fs.openSync(path.join(dd, f), 'r');
      fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      try {
        const o = JSON.parse(buf.toString('utf8').slice(0, 4000).split('\n')[0]);
        if (o && o.cwd) {
          try { if (fs.statSync(o.cwd).isDirectory()) return o.cwd; } catch {}
          return null;
        }
      } catch {}
    } catch {}
  }
  return null;
}

/**
 * Move one session file to a different project (group) directory. This is how
 * "move between groups" is implemented: pi keys a session's project by the
 * directory the .jsonl lives in, so moving the file between project dirs moves
 * it between groups. Pure file op, guarded so the target stays under the
 * sessions dir and the file actually exists first.
 *
 * Returns { ok:true, from, to } or throws a descriptive Error.
 */
function moveSession(fromRel, toDir, sessionsDir) {
  const base = sessionsDir || SESSIONS_DIR;
  const from = resolveSession(fromRel, base);
  if (!from) throw new Error('source session not found: ' + fromRel);
  if (typeof toDir !== 'string' || !toDir) throw new Error('bad target dir');
  const toSeg = toDir.split('/').filter(Boolean).pop();
  if (!toSeg || toSeg === '.' || toSeg === '..' || toSeg.startsWith('.')) throw new Error('bad target dir');
  const toDirFull = path.join(base, toSeg);
  if (!toDirFull.startsWith(base + path.sep)) throw new Error('bad target dir');
  fs.mkdirSync(toDirFull, { recursive: true });
  const to = path.join(toDirFull, path.basename(from));
  if (to === from) return { ok: true, from: fromRel, to: fromRel, noop: true };
  fs.renameSync(from, to);
  return { ok: true, from: fromRel, to: toSeg + '/' + path.basename(from) };
}

// ================================================== reusable prompt templates
/** List the user's reusable prompt templates (one .md each, sorted). */
function listPromptTemplates(templatesDir) {
  try {
    return fs.readdirSync(templatesDir || TEMPLATES_DIR).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort();
  } catch { return []; }
}

/** Read one template by name, or null. Path-traversal guarded by name. */
function getPromptTemplate(name, templatesDir) {
  const base = templatesDir || TEMPLATES_DIR;
  const n = String(name || '');
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(n)) return null;
  try { return fs.readFileSync(path.join(base, n + '.md'), 'utf8'); } catch { return null; }
}

/** Persist one template. Rejects names that could escape the templates dir. */
function savePromptTemplate(name, body, templatesDir) {
  const base = templatesDir || TEMPLATES_DIR;
  const n = String(name || '');
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(n)) throw new Error('bad template name');
  fs.mkdirSync(base, { recursive: true });
  const fp = path.join(base, n + '.md');
  if (!fp.startsWith(path.resolve(base) + path.sep)) throw new Error('bad template name');
  fs.writeFileSync(fp, String(body));
  return n;
}

/** Delete a template (idempotent). */
function deletePromptTemplate(name, templatesDir) {
  const base = templatesDir || TEMPLATES_DIR;
  const n = String(name || '');
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(n)) throw new Error('bad template name');
  const fp = path.join(base, n + '.md');
  if (!fp.startsWith(path.resolve(base) + path.sep)) throw new Error('bad template name');
  try { fs.unlinkSync(fp); } catch {}
  return n;
}

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
 * `sessionsDir` is overridable for tests (defaults to CFG.sessionsDir).
 */
function resolveSession(rel, sessionsDir) {
  if (!rel || rel.includes('..')) return null;
  const base = sessionsDir || SESSIONS_DIR;
  const clean = String(rel).replace(/^\/+/, '');
  const full = path.join(base, clean);
  if (!full.startsWith(base + path.sep)) return null;
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
 * `sessionsDir` is overridable for tests (defaults to CFG.sessionsDir).
 */
function readHead(sessionsDir) {
  const base = sessionsDir || SESSIONS_DIR;
  const out = [];
  let dirs = [];
  try { dirs = fs.readdirSync(base); } catch { return out; }
  for (const d of dirs) {
    const proj = decodeProject(d);
    let files = [];
    try { files = fs.readdirSync(path.join(base, d)); } catch { continue; }
    // Sort newest-first so within-group ordering survives the client-side
    // grouping (per-project Maps key off the first time we see them, which is
    // driven by this list's order). Without this the OS readdir order leaks
    // through and sessions appear out of order within their project.
    files.sort().reverse();
    for (const f of files) {
      if (!/\d{4}-\d{2}-\d{2}T.*\.jsonl$/.test(f)) continue;
      const full = path.join(base, d, f);
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
      } catch {} out.push({
        file: d + '/' + f,
        dir: d,
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
function parseSessionMessages(rel, o = {}, sessionsDir) {
  const full = resolveSession(rel, sessionsDir);
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

// readHead() groups its output per-project below (see handlers) — but the raw
// flat, mtime-desc list is still exported for tests and simple consumers.

module.exports = {
  SESSIONS_DIR,
  templatesDir: TEMPLATES_DIR,
  filenameForSessionId,
  decodeProject,
  resolveSession,
  titleOfFile,
  readHead,
  agentResolveProject,
  moveSession,
  listPromptTemplates,
  getPromptTemplate,
  savePromptTemplate,
  deletePromptTemplate,
  iterMessages,
  parseSessionMessages,
  scanDepth,
};
