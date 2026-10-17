#!/usr/bin/env node
"use strict";
/**
 * pi-bridge — use your `pi` coding agent from your phone browser.
 *
 * Spawns `pi --mode rpc` and serves a small token-protected Web UI.
 * Designed to bind to your Tailscale 100.x address so it works from any
 * network, privately, over Tailscale's encrypted wire.
 *
 *   node server.js [--port 8787] [--host AUTO|IP] [--token TOK] [piExtraArgs]
 */
const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn, execSync } = require("node:child_process");

// ------------------------------------------------------------------ config
const ARGS = process.argv.slice(2);
const extraArgs = [];
let port = 8787, host = "AUTO", cliToken = null;
for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === "--port") { port = Number(ARGS[i + 1]); i++; }
  else if (ARGS[i] === "--host") { host = ARGS[i + 1]; i++; }
  else if (ARGS[i] === "--token") { cliToken = ARGS[i + 1]; i++; }
  else extraArgs.push(ARGS[i]);
}
const PI_BIN = process.env.PI_BIN || "pi";
const CWD = process.env.PIBRIDGE_CWD || process.cwd();
const WEBPUSH = require("./webpush.js");
const HOME = os.homedir();
const TOKEN_FILE = path.join(HOME, ".config/pibridge/token");
const VAPID_FILE = path.join(HOME, ".config/pibridge/vapid.json");

// ------------------------------------------------------------------ per-project agent files
// Each pi project can live at its root two markdown files that agents read:
//   agent_instructions.md  — standing rules for agents working in that project
//   agent_backlog.md        — the ticket backlog
// We let the phone UI show whether they exist, create them from a (user-editable)
// template and edit them in place. A project's real folder (its cwd) is taken from
// the first line of any session .jsonl under ~/.pi/agent/sessions/<dir>/ — that is
// authoritative and avoids ambiguity from the dash-encoded directory names.
const AGENT_SESSIONS_DIR = path.join(HOME, ".pi", "agent", "sessions");
const AGENT_TEMPLATES_STORE = path.join(HOME, ".config", "pibridge", "templates.json");
const AGENT_FILE_KEYS = { instructions: "agent_instructions.md", backlog: "agent_backlog.md" };

const AGENT_DEFAULT_TEMPLATES = {
  instructions: [
    "# Agent Instructions",
    "",
    "Standing rules for any agent working in this project. Read these fully before acting.",
    "",
    "1. Read before you write — look at the relevant files and code before changing anything.",
    "2. Small, testable steps — break the work into subtasks and do them one at a time.",
    "3. Test before you close — run whatever verifies the change (build, tests, or a manual check) before marking a ticket done.",
    "4. Keep the backlog current — track work in `agent_backlog.md` and move tickets as they progress.",
    "5. If blocked, say so — describe what is stuck and the options, and stop instead of guessing at anything irreversible.",
    "",
  ].join("\n"),
  backlog: [
    "# Agent Backlog",
    "",
    "One line per ticket. Move an item between the sections as its state changes.",
    "Use: `[ ]` not started · `[~]` in progress · `[x]` done. Prefix priority when it matters (P0/P1).",
    "",
    "## Backlog",
    "_Future and not-yet-scheduled work._",
    "- [ ] ",
    "",
    "## Current Sprint",
    "_The small set of things committed for this sprint._",
    "- [ ] ",
    "",
    "## Done",
    "_Finished and verified (add a date when you complete one)._",
    "- [x] ",
    "",
  ].join("\n"),
};

function agentLoadTemplates() {
  const t = { instructions: AGENT_DEFAULT_TEMPLATES.instructions, backlog: AGENT_DEFAULT_TEMPLATES.backlog };
  try {
    const o = JSON.parse(fs.readFileSync(AGENT_TEMPLATES_STORE, "utf8"));
    if (typeof o.instructions === "string" && o.instructions.trim() !== "") t.instructions = o.instructions;
    if (typeof o.backlog === "string" && o.backlog.trim() !== "") t.backlog = o.backlog;
  } catch (_) { /* first run or absent — use defaults */ }
  return t;
}
const AGENT_TEMPLATES = agentLoadTemplates();
function agentSaveTemplates() {
  try {
    fs.mkdirSync(path.dirname(AGENT_TEMPLATES_STORE), { recursive: true });
    fs.writeFileSync(AGENT_TEMPLATES_STORE, JSON.stringify(AGENT_TEMPLATES, null, 2) + "\n", "utf8");
    return true;
  } catch (_) { return false; }
}

// Map a session directory name to the real project folder (the pi cwd).
function agentResolveProject(dirName) {
  if (typeof dirName !== "string" || !/^[-+.A-Za-z0-9]+$/.test(dirName)) return null;
  const dd = path.join(AGENT_SESSIONS_DIR, dirName);
  let cwd = null;
  let files = [];
  try { files = fs.readdirSync(dd).filter(f => f.endsWith(".jsonl")).sort(); }
  catch (_) { return null; }
  for (const f of files) {
    try {
      const fd = fs.openSync(path.join(dd, f), "r");
      const buf = Buffer.alloc(2048);
      const n = fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      const first = buf.toString("utf8").slice(0, 8000).split("\n")[0];
      try { const o = JSON.parse(first); if (o.cwd) { cwd = o.cwd; break; } } catch (_) {}
    } catch (_) {}
  }
  if (!cwd) return null; // only ever resolve what we can prove is a directory
  try { if (!fs.statSync(cwd).isDirectory()) return null; } catch (_) { return null; }
  return cwd;
}
function agentProjectCwdOrReply(res, dirName) {
  const cwd = agentResolveProject(dirName);
  if (!cwd) { sendJson(res, 404, { error: "project directory not found on PC" }); return null; }
  return cwd;
}
function agentFileExists(cwd, key) {
  try { return fs.statSync(path.join(cwd, AGENT_FILE_KEYS[key])).isFile(); } catch (_) { return false; }
}
const SUBS_FILE = path.join(HOME, ".config/pibridge/push-subscriptions.json");
const HTTPS_PORT = Number(process.env.PIBRIDGE_HTTPS_PORT || 8443);
const CERT = process.env.PIBRIDGE_CERT || null;
const KEY = process.env.PIBRIDGE_KEY || null;

// VAPID keys (auto-generated, persisted).
const VAPID = WEBPUSH.loadKeys(VAPID_FILE);
if (fs.existsSync(VAPID_FILE)) { /* loaded */ }
else {
  WEBPUSH.saveKeys(VAPID_FILE, VAPID);
  console.error(`[pibridge] wrote new VAPID keys to ${VAPID_FILE}`);
}
// Subscriptions (keyed by endpoint).
const pushSubs = new Map();
try {
  const arr = JSON.parse(fs.readFileSync(SUBS_FILE, "utf8"));
  for (const s of arr) pushSubs.set(s.endpoint, s);
  console.error(`[pibridge] ${pushSubs.size} web-push subscription(s) loaded`);
} catch {}
function savePushSubs() {
  try { fs.writeFileSync(SUBS_FILE, JSON.stringify([...pushSubs.values()], null, 1), { mode: 0o600 }); } catch {}
}
function webPushNotify(title, text) {
  if (!pushSubs.size) return;
  const payload = JSON.stringify({ title, text: text || "" });
  WEBPUSH.fanout([...pushSubs.values()], payload, VAPID).then(({ ok, gone, transient }) => {
    if (transient && transient.length)
      console.error(`[pibridge] web-push: ${transient.length} transient failure(s) — subs kept, will retry next push`);
    let changed = false;
    for (const ep of gone) { pushSubs.delete(ep); changed = true; }
    if (changed) {
      savePushSubs();
      if (!pushSubs.size)
        console.error("[pibridge] WARNING: all web-push subscriptions were GONE — check FCM/VAPID config and push permissions on the device");
    }
  });
}
const POLL_TIMEOUT_MS = 45000;
const MAX_EVENTS = 500;
const HEARTBEAT_MS = 15000;

function loadOrCreateToken() {
  if (cliToken) return cliToken;
  try {
    const t = fs.readFileSync(TOKEN_FILE, "utf8").trim();
    if (t.length >= 16) return t;
  } catch {}
  const t = crypto.randomBytes(24).toString("hex");
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, t + "\n", { mode: 0o600 });
  console.error(`[pibridge] wrote new token to ${TOKEN_FILE}`);
  return t;
}
const TOKEN = loadOrCreateToken();
const isAuthed = (req, url) => {
  const a = url.searchParams.get("token") ||
    (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return typeof a === "string" && a.length >= 16 &&
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(TOKEN));
};

function tailnetIp() {
  try {
    const out = execSync("tailscale ip -4", { encoding: "utf8" }).trim();
    if (/^100\.\d+\.\d+\.\d+$/.test(out)) return out;
  } catch {}
  return null;
}
function pickHost() {
  // Default: all interfaces (LAN + tailnet reachable by any address we own).
  // The API is still gated by token; UI static files are public by design.
  if (host !== "AUTO") return host;
  const t = tailnetIp();
  console.error(`[pibridge] binding 0.0.0.0 (tailscale: ${t || 'down'}; token gates the API)`);
  return "0.0.0.0";
}

// ------------------------------------------------------------------ shared state
let proc = null;
let lineBuf = "";
let seq = 0;
const events = [];               // { s, line }  — recent events for joins/cursors
const state = { model: null, thinkingLevel: null, sessionName: null, sessionId: null, messageCount: 0 };
let streaming = false, compaction = false;
const rpcWaiters = new Map();
const pollers = new Set();

const publicState = () => ({
  agentUp: !!(proc && proc.exitCode === null),
  isStreaming: streaming, isCompacting: compaction,
  model: state.model, thinkingLevel: state.thinkingLevel,
  sessionName: state.sessionName, sessionId: state.sessionId,
  followOn: follow.on, followFile: follow.on ? follow.file : null, followBusy: !!follow.busy, followProject: follow.proj || null
, followName: (function(){ try{ const nm = titleOfFile(path.join(SESSIONS_DIR, follow.file)); return nm||null; }catch(e){ return null; } })()
  , messageCount: state.messageCount, cwd: CWD, tailnet: tailnetIp()
});

function broadcast(rec, toSeqOnlyNew = true) {
  const s = ++seq;
  const line = JSON.stringify({ s, e: rec }) + "\n";
  events.push({ s, line });
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  for (const p of pollers) p.deliver(line);
}

function sendRpc(type, fields = {}, timeoutMs = 20000) {
  if (!proc || proc.exitCode !== null || !proc.stdin.writable)
    return Promise.reject(new Error("agent process not running"));
  const id = "c" + crypto.randomBytes(6).toString("hex");
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { rpcWaiters.delete(id); reject(new Error(`timeout waiting for ${type}`)); }, timeoutMs);
    rpcWaiters.set(id, { resolve, reject, timeout: t });
    proc.stdin.write(JSON.stringify({ id, type, ...fields }) + "\n");
  });
}

function applyStateData(d) {
  if (!d) return;
  streaming = !!d.isStreaming;
  compaction = !!d.isCompacting;
  state.sessionId = d.sessionId || state.sessionId;
  state.model = d.model ? `${d.model.provider}/${d.model.id}` : state.model;
  state.thinkingLevel = d.thinkingLevel ?? state.thinkingLevel;
  state.sessionName = (d.sessionName && d.messageCount>0) ? d.sessionName : null;
  state.messageCount = d.messageCount || 0;
  broadcast({ type: "status", state: publicState() });
}
const applyGetState = () => sendRpc("get_state").then(r => applyStateData(r.data)).catch(() => {});

/* ================= session history / PC-follow / notifications ============ */
const SESSIONS_DIR = path.join(HOME, ".pi", "agent", "sessions");
const CHILD_PROCS = new Set();
const NOTIFS = [];
function filenameForSessionId(id){
  if(!id)return null;
  const suf="_"+id+".jsonl";
  try{for(const d of fs.readdirSync(SESSIONS_DIR)){try{for(const f of fs.readdirSync(path.join(SESSIONS_DIR,d))){if(f.endsWith(suf))return d+"/"+f;}}catch{}}}
catch{}
  return null;
}
function decodeProject(d) {
  let out = String(d);
  if (out.startsWith("--")) out = out.slice(2);      // leading "/"
  if (out.endsWith("--")) out = out.slice(0, -2); // trailing
  return "/" + out.replace(/-/g, "/");              // best-effort display only
}
function resolveSession(rel) {
  if (!rel || rel.includes("..")) return null;
  const clean = String(rel).replace(/^\/+/, "");
  const full = path.join(SESSIONS_DIR, clean);
  if (!full.startsWith(SESSIONS_DIR + path.sep)) return null;
  try { if (!fs.statSync(full).isFile()) return null; } catch { return null; }
  return full;
}
function readHead(titleOnly) {
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
      let title = null, firstTs = null;
      try {
        const fd = fs.openSync(full, "r");
        const buf = Buffer.alloc(Math.min(st.size, 256 * 1024));
        const n = fs.readSync(fd, buf, 0, buf.length, 0);
        fs.closeSync(fd);
        for (const line of buf.slice(0, n).toString("utf8").split("\n")) {
          if (!line.trim()) continue;
          let e; try { e = JSON.parse(line); } catch { continue; }
          if (!firstTs && e.timestamp) firstTs = e.timestamp;
          if (e.type === "message" && e.message && e.message.role === "user") {
            const t = (e.message.content || []).filter(c => c.type === "text").map(c => c.text).join(" ");
            if (t && !t.startsWith("<system")) { title = t.replace(/\s+/g, " ").trim(); break; }
          }
        }
      } catch {}
      out.push({ file: d + "/" + f, project: proj, title: title || "(no content yet)",
                 size: st.size, mtime: st.mtimeMs, firstTs });
    }
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}
// one pass: extract display messages from a jsonl chunk
function iterMessages(chunk, cb) {
  for (const line of chunk.split("\n")) {
    if (!line.trim()) continue;
    let e; try { e = JSON.parse(line); } catch { continue; }
    if (e.type === "compaction") {
      const sum = e.summary || e.text || "";
      if (sum) cb({ role: "info", text: "⟲ context compacted: " + String(sum).slice(0, 160), ts: e.timestamp });
      continue;
    }
    if (e.type !== "message" || !e.message) continue;
    const m = e.message;
    if (m.role === "system" || m.role === "toolResult") continue;
    const ts = e.timestamp || m.timestamp;
    if (m.role === "user") {
      const t = (m.content || []).filter(c => c.type === "text").map(c => c.text).join("\n").trim();
      if (t && !t.startsWith("<system")) cb({ role: "user", text: t.slice(0, 8000), ts });
      continue;
    }
    if (m.role === "assistant") {
      let thinking = "", text = ""; const tools = [];
      for (const c of (m.content || [])) {
        if (c.type === "thinking" && c.thinking) thinking += c.thinking;
        else if (c.type === "toolCall") tools.push(c.name || c.toolName || "tool");
        else if (c.type === "text") text += c.text;
      }
      text = text.trim();
      if (!text && !thinking) continue;
      cb({ role: "assistant", text: text.slice(0, 30000),
           tools: tools.length ? tools.slice(0, 40) : undefined,
           thinking: thinking.slice(0, 400) + (thinking.length > 400 ? " …" : ""), ts });
    }
  }
}
function parseSessionMessages(rel, o = {}) {
  const full = resolveSession(rel);
  if (!full) return null;
  const MAX = 4 * 1024 * 1024;
  const sz = fs.statSync(full).size;
  const off = Math.max(0, sz - MAX);
  const fd = fs.openSync(full, "r");
  const len = sz - off;
  const buf = Buffer.alloc(len + 64);
  const n = fs.readSync(fd, buf, 0, len + 64, off);
  fs.closeSync(fd);
  let s2 = buf.slice(0, n).toString("utf8");
  if (off > 0) { const i = s2.indexOf("\n"); if (i >= 0) s2 = s2.slice(i + 1); }
  const out = [];
  iterMessages(s2, m => out.push(m));
  return out.slice(-Math.max(1, parseInt(o.maxMsgs || 250, 10)));
}
// open work units = user prompts sent − assistant text replies produced
function scanDepth(full) {
  let off = 0; const sz = fs.statSync(full).size;
  const fd = fs.openSync(full, "r");
  let users = 0, atext = 0, carry = "";
  for (;;) {
    const len = Math.min(1024 * 1024, sz - off);
    if (len <= 0) break;
    const buf = Buffer.alloc(len);
    const n = fs.readSync(fd, buf, 0, len, off);
    off += n;
    let s3 = carry + buf.slice(0, n).toString("utf8");
    carry = "";
    const li = s3.lastIndexOf("\n");
    if (li < 0) { carry = s3; continue; }
    carry = s3.slice(li + 1);
    s3 = s3.slice(0, li + 1);
    for (const line of s3.split("\n")) {
      if (!line.includes('"message"')) continue;
      let e; try { e = JSON.parse(line); } catch { continue; }
      if (e.type !== "message" || !e.message) continue;
      if (e.message.role === "user" && (e.message.content || []).some(c => c.type === "text" && !c.text.startsWith("<system"))) users++;
      if (e.message.role === "assistant" && (e.message.content || []).some(c => c.type === "text" && c.text.trim())) atext++;
    }
  }
  fs.closeSync(fd);
  return Math.max(0, users - atext);
}

const follow = {
  on: false, file: null, proj: null, off: 0, depth: 0, busy: false,
  lastReply: "", msgs: [], timer: null, note: "", startedAt: 0,
  ongoing: false, lastActivity: 0, stallNotified: false
};
function publicFollow() {
  let nm = follow.name || null;
  if (!nm && follow.file) { const _h = readHead().find(x => x.file === follow.file); nm = (_h && _h.title) || null; }
  return { on: follow.on, file: follow.file, project: follow.proj, busy: follow.busy, name: nm,
           ongoing: follow.ongoing, depth: follow.depth, lastReply: follow.lastReply.slice(-300),
           msgs: follow.msgs.slice(-12), sinceMin: follow.on ? Math.round((Date.now() - follow.startedAt) / 60000) : 0 };
}
function ntfy(title, text) {
  try {
    const tokPath = path.join(HOME, ".local", "share", "ntfy-pibridge", "access-token");
    const args = ["-s", "--max-time", "5", "-X", "POST",
      "http://127.0.0.1:3333/pibridge",
      "-H", "Title: " + String(title).slice(0, 180).replace(/\r|\n/g, " "),
      "-H", "Accept: application/json"];
    try { args.push("-H", "Authorization: Bearer " + fs.readFileSync(tokPath, "utf8").trim()); } catch {}
    args.push("-d", String(text || "").slice(0, 400));
    const c = require("node:child_process").spawn("curl", args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    c.stdout.on("data", d => out += d);
    c.stderr.on("data", d => out += d.toString());
    CHILD_PROCS.add(c);
    c.on("error", e => { console.error("[pibridge] ntfy publish error:", e.message); });
    c.on("exit", (code) => {
      CHILD_PROCS.delete(c);
      if (code !== 0) console.error("[pibridge] ntfy publish failed (exit " + code + "):", out.slice(0, 300));
    });
  } catch (e) { console.error("[pibridge] ntfy publish error:", e.message); }
}
function addNotif(title, text) {
  NOTIFS.push({ at: Date.now(), title: String(title).slice(0, 200), text: String(text || "").slice(0, 300) });
  if (NOTIFS.length > 50) NOTIFS.splice(0, NOTIFS.length - 50);
  ntfy(title, text);
  webPushNotify(title, text);
}
function stopFollow(notes) {
  if (follow.timer) clearInterval(follow.timer);
  follow.timer = null; follow.on = false; follow.busy = false;
  follow.note = notes || "";
}
function startFollow(rel, ongoing) {
  const full = resolveSession(rel);
  if (!full) return { error: "bad session file" };
  if (follow.timer) clearInterval(follow.timer);
  follow.on = true; follow.file = rel; follow.ongoing = !!ongoing;
  follow.proj = decodeProject(rel.split("/")[0]);
  follow.off = fs.statSync(full).size;
  follow.depth = scanDepth(full);
  follow.busy = follow.depth > 0;
  follow.msgs = []; follow.lastReply = "follow started"; follow.note = "";
  follow.startedAt = Date.now(); follow.lastActivity = Date.now(); follow.stallNotified = false;
  const wasBusy = follow.busy;
  follow.timer = setInterval(tickFollow, 1500);
  if (!wasBusy) follow.lastReply = "(idle — agent waiting for your prompt)";
  if (wasBusy) follow.lastReply = "(follow started while agent was mid-turn)";
  return publicFollow();
}
// keep "the live session" followed: detect the active session id and (re)point follow at it
setInterval(function(){
  try{
    if(!state.sessionId) return;
    if(follow.on && follow.file && follow.file.endsWith(state.sessionId)) return; // same session
    const f=filenameForSessionId(state.sessionId); if(!f) return;
    startFollow(f, true);
    if(global.__autoFollowFile!==f){global.__autoFollowFile=f;console.error("[pibridge] auto-follow active session: "+f)}
    if(!global.__autoFollowLog){global.__autoFollowLog=true;console.error("[pibridge] auto-follow ENGAGED, watching new-message flow")}
  }catch(err){}
}, 2000);
function tickFollow() {
  if (!follow.on) return;
  let st;
  try { st = fs.statSync(resolveSession(follow.file)); }
  catch {
    stopFollow("PC session file vanished (closed or renamed)");
    addNotif("pi (PC) — follow ended", "The session file disappeared.");
    return;
  }
  if (st.size < follow.off) { follow.off = 0; }        // file rewound/rotated
  if (st.size === follow.off) return;
  const fd = fs.openSync(resolveSession(follow.file), "r");
  const len = st.size - follow.off;
  const buf = Buffer.alloc(len + 64);
  const n = fs.readSync(fd, buf, 0, len + 64, follow.off);
  fs.closeSync(fd);
  let s4 = buf.slice(0, n).toString("utf8");
  const li = s4.lastIndexOf("\n");
  if (li < 0) return;                                  // wait for full line
  s4 = s4.slice(0, li + 1);
  follow.off += li + 1;
  let userNew = 0, asstText = 0, lastUser = null;
  iterMessages(s4, m => {
    if (m.role === "user") { userNew++; lastUser = m.text; follow.msgs.push({ r: "you", t: m.text.slice(0, 200), ts: m.ts }); }
    else if (m.role === "assistant" && m.text) { asstText++; follow.msgs.push({ r: "pi", t: m.text.slice(0, 300), ts: m.ts }); }
  });
  if (userNew || asstText) { follow.lastActivity = Date.now(); follow.stallNotified = false; }
  if (follow.msgs.length > 30) follow.msgs.splice(0, follow.msgs.length - 30);
  if (asstText && follow.msgs.length) follow.lastReply = follow.msgs[follow.msgs.length - 1].t;
  const before = follow.depth;
  follow.depth = Math.max(0, follow.depth + userNew - asstText);
  if (userNew && before === 0 && !follow.busy) {
    follow.busy = true;
    addNotif("pi (PC) → working", "New prompt: " + (lastUser || "").slice(0, 150));
  }
  if (follow.busy && before > 0 && follow.depth === 0 && asstText) {
    const done = follow.ongoing;
    follow.busy = false;
    addNotif("pi (PC) → needs your input", follow.lastReply.slice(0, 220));
    if (!done) stopFollow();                          // one-shot: follow was for a single turn
  }
  if (follow.depth > 0 && !follow.stallNotified && Date.now() - (follow.lastActivity || 0) > 90000) {
    follow.stallNotified = true;
    addNotif("pi (PC) → stuck mid-turn?", "Open prompt, no agent output for 90s+. Check the session.");
  }
}
function waitNotify(res, timeoutMs) {
  const end = Date.now() + timeoutMs;
  (function check() {
    if (NOTIFS.length) return res.end(JSON.stringify({ ok: true, n: NOTIFS.splice(0) }));
    if (Date.now() >= end) return res.end(JSON.stringify({ ok: true, n: [] }));
    setTimeout(check, 150);
  })();
}

function handleLine(raw) {
  let rec;
  try { rec = JSON.parse(raw); } catch { return; }
  if (rec.type === "response") {
    const w = rpcWaiters.get(rec.id);
    if (w) {
      rpcWaiters.delete(rec.id);
      clearTimeout(w.timeout);
      rec.success ? w.resolve(rec) : w.reject(new Error(String(rec.error || "command failed")));
    }
    return;
  }
  if (rec.type === "agent_start") streaming = true;
  else if (rec.type === "agent_settled") { streaming = false; applyGetState(); }
  else if (rec.type === "compaction_start") compaction = true;
  else if (rec.type === "compaction_end") { compaction = false; applyGetState(); }
  else if (rec.type === "thinking_level_changed") state.thinkingLevel = rec.level;
  else if (rec.type === "session_info_changed") state.sessionName = rec.name || null;
  else if (rec.type === "extension_error")
    broadcast({ type: "extension_error", note: `${rec.extensionPath || "extension"}: ${String(rec.error).slice(0, 300)}` });
  broadcast(rec);
}

function startProcess() {
  const args = ["--mode", "rpc", ...extraArgs];
  proc = spawn(PI_BIN, args, { cwd: CWD, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, PIPED: "1" } });
  console.error(`[pibridge] started child: ${PI_BIN} ${args.join(" ")} (pid ${proc.pid}, cwd ${CWD})`);
  proc.stdout.setEncoding("utf8");
  proc.stdout.on("data", d => {
    lineBuf += d;
    let i;
    while ((i = lineBuf.indexOf("\n")) >= 0) {
      const line = lineBuf.slice(0, i);
      lineBuf = lineBuf.slice(i + 1);
      if (line.trim()) handleLine(line.replace(/\r$/, ""));
    }
  });
  proc.stderr.on("data", d => {
    const s = String(d).trim();
    if (s) console.error("[pi] " + s);
  });
  proc.on("close", (code) => {
    console.error(`[pibridge] pi child exited (code ${code}); retry in 3s`);
    broadcast({ type: "system", note: `agent exited (${code}), restarting` });
    setTimeout(startProcess, 3000);
  });
  setTimeout(applyGetState, 700);
}

startProcess();

// ------------------------------------------------------------------ http bits
const sendJson = (res, code, obj) => {
  const b = JSON.stringify(obj);
  res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(b);
};
const readBody = (req, limit = 8 * 1024 * 1024) => new Promise((resolve, reject) => {
  let data = "";
  req.on("data", c => {
    data += c;
    if (data.length > limit) { reject(new Error("body too large")); req.destroy(); }
  });
  req.on("end", () => resolve(data));
  req.on("error", reject);
});


function handlePoll(req, res, url) {
  const oldest = events.length ? events[0].s : seq + 1;
  let cursor = Number(url.searchParams.get("cursor"));
  const head = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" };
  if (!Number.isFinite(cursor) || cursor < oldest - 1) {
    res.writeHead(200, head);
    return res.end(events.map(e => e.line).join(""));
  }
  cursor = Math.max(cursor, oldest - 1);
  const out = events.filter(e => e.s > cursor).map(e => e.line).join("");
  if (out) { res.writeHead(200, head); return res.end(out); }
  let closed = false;
  const p = { deliver: l => { if (!closed) res.write(l); }, close: () => {} };
  pollers.add(p);
  const timer = setTimeout(finish, POLL_TIMEOUT_MS);
  const hb = setInterval(() => { if (!closed && !res.writableLength) res.write(": hb\n"); }, HEARTBEAT_MS);
  res.on("close", finish);
  function finish() {
    if (closed) return;
    closed = true;
    pollers.delete(p);
    clearTimeout(timer);
    clearInterval(hb);
    try { res.end(); } catch {}
  }
}


async function handleSend(req, res) {
  let body = {};
  try { body = JSON.parse((await readBody(req)) || "{}"); }
  catch { return sendJson(res, 400, { error: "bad json" }); }
  if (body.switchFile) {
    const full = resolveSession(body.switchFile);
    if (!full) return sendJson(res, 400, { error: "bad session file" });
    try {
      const r = await sendRpc("switch_session", { sessionPath: full }, 20000);
      if (r.data && r.data.cancelled) return sendJson(res, 409, { error: "switch cancelled by extension" });
      sendJson(res, 200, { ok: true });
    } catch (e) { sendJson(res, 500, { error: String(e.message || e) }); }
    return;
  }
  const message = String(body.message || "").trim();
  if (!message) return sendJson(res, 400, { error: "empty message" });
  const behavior = body.behavior === "followUp" ? "followUp" : "steer";
  if (state.messageCount === 0 && !state.sessionName) {
    const name = message.replace(/\s+/g, " ").slice(0, 60);
    if (name) sendRpc("set_session_name", { name }).catch(() => {});
  }
  try {
    const r = await sendRpc("prompt", { message, streamingBehavior: behavior });
    sendJson(res, 200, { ok: true, disposition: (r.data && r.data.disposition) || "started" });
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
}

const postAbort = async (req, res) => {
  try { await sendRpc("abort", {}, 30000); sendJson(res, 200, { ok: true }); }
  catch (e) { sendJson(res, 500, { error: String(e.message || e) }); }
};

const postNewSession = async (req, res) => {
  try {
    await sendRpc("new_session", {}, 15000);
    state.messageCount = 0;
    state.sessionName = null;
    applyGetState();
    sendJson(res, 200, { ok: true });
  } catch (e) { sendJson(res, 500, { error: String(e.message || e) }); }
};
const titleOfFile = (full) => {
  try {
    const sz = fs.statSync(full).size;
    const fd = fs.openSync(full, "r");
    const n = Math.min(sz, 256*1024);
    const buf = Buffer.alloc(n); fs.readSync(fd, buf, 0, n, 0); fs.closeSync(fd);
    for (const line of buf.slice(0, n).toString("utf8").split("\n")) {
      if (!line.trim()) continue;
      let e; try { e = JSON.parse(line); } catch { continue; }
      if (e.type === "message" && e.message && e.message.role === "user") {
        const t = (e.message.content || []).filter(c => c.type === "text").map(c => c.text).join(" ");
        if (t && !t.startsWith("<system")) return t.replace(/\s+/g, " ").slice(0, 60);
      }
    }
  } catch {}
  return null;
};
const resumeSession = async (rel) => {
  if (streaming) return { error: "agent is working on a turn – Stop it first, then retry" };
  const full = resolveSession(rel);
  if (!full) return { error: "bad session file" };
  try {
    const r = await sendRpc("switch_session", { sessionPath: full }, 20000);
    if (r.data && r.data.cancelled) return { error: "switch cancelled by extension" };
    state.messageCount = 0;           // force chat to re-load messages from the switched session
    state.sessionName = titleOfFile(full) || state.sessionName;   // keep original name (avoid auto-rename on next prompt)
    applyGetState();
    broadcast({ type: "system", note: "now replying in: " + rel });
    return { ok: true, project: decodeProject(rel.split("/")[0]) };
  } catch (e) { return { error: String(e.message || e) }; }
};
const postLevel = async (req, res) => {
  try {
    const r = await sendRpc("cycle_thinking_level", {}, 5000);
    const st = r.data || {};
    state.thinkingLevel = st.level ?? state.thinkingLevel;
    broadcast({ type: "thinking_level_changed", level: state.thinkingLevel });
    sendJson(res, 200, { ok: true, level: state.thinkingLevel });
  } catch (e) { sendJson(res, 500, { error: String(e.message || e) }); }
};
const PAGE_VER = "C97";
const c256=()=>require("crypto").createHash("sha256").update(fs.readFileSync(__dirname+"/app.js")).digest("hex").slice(0,16); // bump whenever index.html / app.js / sw.js shipped together
const STATIC = {
  ["/p/" + PAGE_VER]: [ "index.html", "text/html; charset=utf-8" ],
  "/app.bundle.js": [ "app.js", "text/javascript; charset=utf-8" ],
  "/app.bundle.js.sha256": [ null, null ],
  "/app.js": [ "app.js", "text/javascript; charset=utf-8" ],
  "/sw.js": [ "sw.js", "text/javascript; charset=utf-8" ],
};
async function handleApi(req, res, baseUrl) {
  const url = new URL(req.url, baseUrl);
  const p = url.pathname === "/" ? "/p/" + PAGE_VER : url.pathname;
  if (url.pathname === "/" || url.pathname === "/p/" || url.pathname === "/p/" + PAGE_VER + "/") { const q = url.search ? url.search : ""; res.writeHead(302, { "location": "/p/" + PAGE_VER + q, "cache-control": "no-store" }); return res.end(); }
  const api = p.startsWith("/api/");
  if (api && p !== "/api/health" && p !== "/api/push/vapid-key" && !isAuthed(req, url)) {
    return sendJson(res, 403, { error: "bad token" });
  }
  if (p === "/api/diag" && req.method === "POST") {
    readBody(req).then(t => {
      t = String(t).slice(0, 1500);
      fs.appendFileSync(__dirname + "/diag.log", "[" + new Date().toISOString() + "] " + t + "\n");
      console.error("[DIAG] " + t);
      return sendJson(res, 200, { ok: 1 });
    }).catch(() => sendJson(res, 500, { error: "body" }));
    return;
  }
  if (p === "/app.bundle.js.sha256") { res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" }); return res.end(c256()); }
  if (p === "/api/health") return sendJson(res, 200, { ok: 1, state: publicState() });
  if (p === "/api/state") return sendJson(res, 200, { state: publicState(), seq: seq });
  if (p === "/api/messages") {
    sendRpc("get_messages").then(r => sendJson(res, 200, { messages: (r.data && r.data.messages) || [] }))
      .catch(e => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }
    if (p === "/api/poll") return handlePoll(req, res, url);
  if (p === "/api/send" && req.method === "POST") return handleSend(req, res);
  if (p === "/api/abort" && req.method === "POST") return postAbort(req, res);
  if (p === "/api/new-session" && req.method === "POST") return postNewSession(req, res);
  if (p === "/api/resume" && req.method === "POST") { const b = await readBody(req).then(x=>{try{return JSON.parse(x)}catch{return{}}}); const r = await resumeSession(b.file); return sendJson(res, r.error?400:200, r); }
  // ---- Web Push (VAPID/ECE) ----
  if (p === "/api/push/vapid-key") return sendJson(res, 200, { publicKey: VAPID.publicKey });
  if (p === "/api/push/subscribe" && req.method === "POST") return readBody(req).then(function(bt){
    var b={}; try{ b=JSON.parse(bt||"{}"); }catch(e){ return sendJson(res,400,{error:"bad json"}); }
    if(!b.endpoint||!b.keys||!b.keys.p256dh||!b.keys.auth) return sendJson(res,400,{error:"bad subscription"});
    pushSubs.set(b.endpoint,b); savePushSubs();
    console.error("[pibridge] web-push subscribe ("+pushSubs.size+" subs)");
    sendJson(res,200,{ok:true,count:pushSubs.size});
  });
  if (p === "/api/push/unsubscribe" && req.method === "POST") return readBody(req).then(function(bt){
    var b={}; try{ b=JSON.parse(bt||"{}"); }catch(e){}
    if(b.endpoint){ pushSubs.delete(b.endpoint); savePushSubs(); }
    sendJson(res,200,{ok:true,count:pushSubs.size});
  });
  if (p === "/api/level" && req.method === "POST") return postLevel(req, res);


  if (p === "/api/sessions") {
    if (req.method === "POST") {
      (async () => {
        let b = {};
        try { b = JSON.parse((await readBody(req)) || "{}"); }
        catch { return sendJson(res, 400, { error: "bad json" }); }
        if (b.delete) {
          const rel = String(b.delete || "");
          const full = resolveSession(rel);
          if (!full) return sendJson(res, 400, { error: "bad session file" });
          if (state.sessionId && rel.endsWith("_" + state.sessionId + ".jsonl"))
            return sendJson(res, 400, { error: "cannot delete the session the agent is currently in" });
          if (follow.on && follow.file === rel) stopFollow("session deleted from phone");
          try {
            fs.unlinkSync(full);
            console.error("[pibridge] deleted session file: " + rel);
            sendJson(res, 200, { ok: true, deleted: rel });
          } catch (e) { sendJson(res, 500, { error: String(e.message || e) }); }
          return;
        }
        if (b.follow) {
          const r = startFollow(b.follow, b.ongoing);
          sendJson(res, r.error ? 400 : 200, r.error ? { error: r.error } : { ok: true, follow: publicFollow() });
        } else {
          stopFollow("stopped from phone");
          sendJson(res, 200, { ok: true, follow: publicFollow() });
        }
      })();
      return;
    }
    sendJson(res, 200, { follow: publicFollow(), sessions: readHead() });
    return;
  }
  if (p === "/api/session-view") {
    const rel = url.searchParams.get("file");
    const msgs = parseSessionMessages(rel);
    if (msgs === null) return sendJson(res, 400, { error: "bad session file" });
    const meta = readHead().find(x => x.file === rel) || {};
    sendJson(res, 200, { file: rel, project: meta.project || null, title: meta.title || null, messages: msgs });
    return;
  }
  // ---- per-project agent files (agent_instructions.md / agent_backlog.md) ----
  if (p === "/api/agent-templates") {
    if (req.method === "POST") {
      return readBody(req).then(t => {
        let b = {}; try { b = JSON.parse(t || "{}"); } catch (_) { return sendJson(res, 400, { error: "bad json" }); }
        for (const k of Object.keys(AGENT_FILE_KEYS)) {
          if (typeof b[k] !== "string") return sendJson(res, 400, { error: "template."+k+" required (string)" });
          AGENT_TEMPLATES[k] = b[k].slice(0, 200000);
        }
        if (!agentSaveTemplates()) return sendJson(res, 500, { error: "could not save templates on disk" });
        console.error("[pibridge] agent templates updated");
        return sendJson(res, 200, { ok: true, templates: AGENT_TEMPLATES });
      });
    }
    return sendJson(res, 200, { templates: AGENT_TEMPLATES });
  }
  if (p === "/api/agent-files") {
    const urlq = url.searchParams;
    const k = urlq.get("key");
    const d = urlq.get("dir");
    if (!AGENT_FILE_KEYS[k]) return sendJson(res, 400, { error: "unknown file key (use 'instructions' or 'backlog')" });
    if (req.method === "GET") {
      const cwd = agentProjectCwdOrReply(res, d);
      if (!cwd) return;
      const file = path.join(cwd, AGENT_FILE_KEYS[k]);
      let exists = false, content = "";
      try { exists = fs.statSync(file).isFile(); } catch (_) {}
      if (exists) {
        try { content = fs.readFileSync(file, "utf8").slice(0, 1000000); }
        catch (e) { return sendJson(res, 500, { error: "read failed: " + (e.message || e) }); }
      }
      return sendJson(res, 200, { key: k, file: AGENT_FILE_KEYS[k], exists, content, cwd });
    }
    if (req.method === "POST") {
      return readBody(req).then(t => {
        let b = {}; try { b = JSON.parse(t || "{}"); } catch (_) { return sendJson(res, 400, { error: "bad json" }); }
        const cwd = agentProjectCwdOrReply(res, d);
        if (!cwd) return;
        const fromTpl = !!b.fromTemplate;
        const content = (fromTpl ? AGENT_TEMPLATES[k] : String(b.content == null ? "" : b.content)).slice(0, 1000000);
        const fPath = path.join(cwd, AGENT_FILE_KEYS[k]);
        try {
          fs.writeFileSync(fPath, content, "utf8");
        } catch (e) { return sendJson(res, 500, { error: "write failed: " + (e.message || e) }); }
        console.error("[pibridge] saved " + fPath + (fromTpl ? " (from template)" : ""));
        return sendJson(res, 200, { ok: true, exists: true, file: AGENT_FILE_KEYS[k], cwd });
      });
    }
    return sendJson(res, 405, { error: "method not allowed" });
  }
  if (p === "/api/test-notify" && req.method === "GET") {
    addNotif("pi (PC) → test notification", "Notification pipeline is working. " + new Date().toLocaleTimeString());
    return sendJson(res, 200, { ok: true });
  }
  if (p === "/api/notify") {
    waitNotify(res, Math.min(15000, Number(url.searchParams.get("timeout")) || 12000));
    return;
  }
  const st = STATIC[p];
  if (st) {
    const f = path.join(__dirname, st[0]);
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
    res.writeHead(200, { "content-type": st[1], "cache-control": "no-store" });
    return res.end(fs.readFileSync(f));
  }
  if (api) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("not found"); }
  res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
  res.end("<!doctype html><meta charset=utf-8><title>404</title><body style=\"background:#0f1115;color:#e6e9ef;font:16px system-ui;display:flex;height:100vh;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:20px\"><h2>not found: " + new URLSearchParams(location.search).get("p") + "</h2><p>the page moved or the link is stale</p><a href=\"/p/" + PAGE_VER + "\"style=\"color:#6ea8fe;font-size:18px\">↩ go to the bridge</a>");
}

const server = http.createServer(function(req, res){ handleApi(req, res, "http://x"); });

// Optional HTTPS (Web Push requires a secure origin). Bind if PIBRIDGE_CERT/KEY (files) are set.
if (CERT && KEY) {
  try {
    const httpsServer = https.createServer(
      { cert: fs.readFileSync(CERT), key: fs.readFileSync(KEY) },
      function(req, res){ handleApi(req, res, "https://x"); });
    httpsServer.listen(HTTPS_PORT, "0.0.0.0", () => {
      console.log("[pibridge] HTTPS on :"+HTTPS_PORT+"  (Web Push enabled)");
    });
  } catch (e) {
    console.error("[pibridge] HTTPS disabled: " + (e.message||e));
  }
} else if (port === 8443 || process.env.PIBRIDGE_HTTPS) {
  console.error("[pibridge] NOTE: Web Push needs HTTPS. Set PIBRIDGE_CERT / PIBRIDGE_KEY to enable the :8443 TLS listener.");
}

const bound = pickHost();
server.listen(port, bound, () => {
  const t = tailnetIp();
  let hostName = null;
  try { const _sj = JSON.parse(execSync("tailscale status --json",{encoding:"utf8"})); hostName = (_sj.Self||{}).PeerName||null; } catch(e) { hostName = null; }
  console.log("[pibridge] listening on " + (bound==="0.0.0.0"?"* (all interfaces)":bound) + ":" + port);
  console.log("[pibridge] this PC:   http://127.0.0.1:" + port + "/");
  if (t) {
    console.log("[pibridge] phone (needs tailscale up): http://" + t + ":" + port + (hostName ? "  (hostname " + hostName + ")" : ""));
  } else {
    console.log("[pibridge] WARNING tailscale is DOWN. Phone access requires:  sudo tailscale up");
  }
  console.log("[pibridge] token (paste into the auth box):  " + TOKEN_FILE);
  console.log("[pibridge] LAN (if tailscale stays down):  http://<your-pc-lan-ip>:" + port + "/");
});
// note: phone should use https://crispy-pc.tailXXXX.ts.net:8787 (click through cert warning); LAN: http://100.x... via tailnet only
