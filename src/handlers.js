'use strict';
/**
 * handlers.js — the entire HTTP request lifecycle.
 *
 *  handleApi(req, res, baseUrl, ctx)  — the main router (see the map below).
 *  accessLog(req, res)               — per-request access log (token-stripped).
 *
 * ctx is the bundle of runtime handles built once in index.js:
 *   { agent, follow, notify, auth, cfg, staticRoutes, staticBasePath }
 *
 * Routes (auth = requires the shared token unless noted as (pub)):
 *
 *   GET  / , /p/            → 302 to /p/<PAGE_VER>
 *   GET  /p/<PAGE_VER>      → components/index.html                     (pub, static shell)
 *   GET  /app.bundle.js     → components/app.js (+ .sha256 twin)        (pub)
 *   GET  /sw.js             → components/sw.js                          (pub)
 *
 *   GET  /api/health        (pub) { ok, state }
 *   GET  /api/state         { state, seq }
 *   GET  /api/messages      { messages[] }                    — full transcript via the agent
 *   GET  /api/poll?cursor=n → NDJSON stream of {s, e} events  — live transcript / streaming
 *   POST /api/send          { message } | { switchFile }      — prompt the agent
 *   POST /api/abort                                — interrupt the in-flight turn
 *   POST /api/new-session                           — start a fresh conversation
 *   POST /api/resume     { file }                   — attach to an existing transcript
 *   POST /api/level                               — cycle the thinking level
 *   GET  /api/push/vapid-key (pub) { publicKey }   — for ServiceWorker registration
 *   POST /api/push/subscribe / unsubscribe
 *   GET  /api/sessions                          — list transcripts + follow state
 *   POST /api/sessions  { file } / { follow } / {} — resume / start-follow / stop
 *   GET  /api/session-view?file=                — decode one transcript to messages[]
 *   GET  /api/agent-files?dir=&key=            — read a project's agent_*.md
 *   POST /api/agent-files  { content|fromTemplate }
 *   GET  /api/agent-templates / POST — the (editable) seed templates
 *   GET  /api/notify?timeout=ms → long-poll, resolves with pending ntfy items
 *   GET  /api/test-notify                          — fire a fake notification end-to-end
 *   POST /api/diag          (pub)  — unauth client-side diagnostic sink
 */
const fs = require('node:fs');
const path = require('node:path');
const { CFG } = require('./config.js');
const S = require('./sessions.js');
const {
  AGENT_FILE_KEYS,
  AGENT_TEMPLATES,
  agentProjectCwdOrReply,
  agentSaveTemplates,
} = require('./agentFiles.js');
const { bundleSha, PAGE_VER } = require('./static.js');

// ---------------------------------------------------------------- helpers
const sendJson = (res, code, obj) => {
  const b = JSON.stringify(obj);
  res.writeHead(code, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(b);
};

const readBody = (req, limit = 8 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > limit) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

/**
 * GET /api/poll — a long-lived NDJSON stream of agent events.
 *
 * A "client" in this context is any browser tab / phone that has opened the
 * UI. The UI keeps exactly one /api/poll connection alive at a time; when a
 * client disconnects (mobile OS suspend, user closes the tab) `res.on('close')`
 * fires and we remove it from `ctx.agent.pollers`. The first byte written back
 * is a replay of up-to-CFG.maxEvents recent events so a re-joining client
 * doesn't miss anything. After that we stream `{s, e}` lines as they happen,
 * with a `: hb` comment every 15 s to keep proxies from closing the socket.
 */
function handlePoll(req, res, url, ctx) {
  const { agent } = ctx;
  const oldest = agent.events.length ? agent.events[0].s : 0;
  let cursor = Number(url.searchParams.get('cursor'));
  const head = {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'x-accel-buffering': 'no',
  };
  // No cursor (first join) or an ancient one: replay the whole recent ring.
  if (!Number.isFinite(cursor) || cursor < oldest - 1) {
    res.writeHead(200, head);
    return res.end(agent.events.map((e) => e.line).join(''));
  }
  cursor = Math.max(cursor, oldest - 1);
  const out = agent.events.filter((e) => e.s > cursor).map((e) => e.line).join('');
  if (out) {
    res.writeHead(200, head);
    return res.end(out);
  }

  // No events since our cursor: open the channel and stream new ones.
  let closed = false;
  const p = { deliver: (l) => { if (!closed) res.write(l); }, close: () => {} };
  agent.pollers.add(p);
  const timer = setTimeout(finish, CFG.pollTimeoutMs);
  const hb = setInterval(() => {
    if (!closed && !res.writableLength) res.write(': hb\n');
  }, CFG.heartbeatMs);
  res.on('close', finish);
  function finish() {
    if (closed) return;
    closed = true;
    agent.pollers.delete(p);
    clearTimeout(timer);
    clearInterval(hb);
    try { res.end(); } catch {}
  }
}

// ---------------------------------------------------------------- POST /api/send
async function handleSend(req, res, ctx) {
  const { agent } = ctx;
  let body = {};
  try {
    body = JSON.parse((await readBody(req)) || '{}');
  } catch {
    return sendJson(res, 400, { error: 'bad json' });
  }
  if (body.switchFile) {
    const full = S.resolveSession(body.switchFile);
    if (!full) return sendJson(res, 400, { error: 'bad session file' });
    try {
      const r = await agent.sendRpc('switch_session', { sessionPath: full }, 20000);
      if (r.data && r.data.cancelled) return sendJson(res, 409, { error: 'switch cancelled by extension' });
      sendJson(res, 200, { ok: true });
    } catch (e) {
      sendJson(res, 500, { error: String(e.message || e) });
    }
    return;
  }
  const message = String(body.message || '').trim();
  if (!message) return sendJson(res, 400, { error: 'empty message' });
  const behavior = body.behavior === 'followUp' ? 'followUp' : 'steer';
  // Per-project new session: prepend a one-shot context line to the FIRST
  // message so the agent knows which project it is in. `pendingProject` is
  // cleared after use so it does not leak into later turns.
  let msg = message;
  if (agent.pendingProject) {
    msg = '[context] working in project: ' + agent.pendingProject + '\n' + message;
    delete agent.pendingProject;
  }
  // New-conversation heuristic: when we've sent no messages and the agent
  // hasn't been given a name yet, turn the first user prompt into the session
  // title (same thing the desktop UI does).
  if (agent.state.messageCount === 0 && !agent.state.sessionName) {
    const name = message.replace(/\s+/g, ' ').slice(0, 60);
    if (name) agent.sendRpc('set_session_name', { name }).catch(() => {});
  }
  try {
    // GPU arbitration (approach A): claim the shared GPU for this side NOW,
    // so the conscience-serve manager — the sole arbiter — sees pi-bridge as
    // the newest owner and yields VRAM to the Ollama model this prompt loads.
    // Best-effort and non-blocking (it just stamps a file); a failure here
    // must never cost the user their prompt.
    require('./gpu.js').claimGpu();
    const r = await agent.sendRpc('prompt', { message: msg, streamingBehavior: behavior });
    sendJson(res, 200, { ok: true, disposition: (r.data && r.data.disposition) || 'started' });
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
}

const postAbort = async (req, res, ctx) => {
  try {
    await ctx.agent.sendRpc('abort', {}, 30000);
    sendJson(res, 200, { ok: true });
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
};

const labelOf = (d) => { try { return String(d).split('/').filter(Boolean).slice(-1)[0] || d; } catch { return d; } };
const postNewSession = async (req, res, ctx) => {
  // Optional { project: '<encoded dir or real path>' } — start the session in
  // that project's context. pi's `new_session` RPC has no cwd argument, so we
  // can't move the agent's working dir; instead we record the project and seed
  // a short preamble so the agent knows which project it is working in.
  let projectDir = null;
  try {
    const raw = await readBody(req);
    if (raw) { const o = JSON.parse(raw); if (o && o.project) projectDir = S.agentResolveProject(String(o.project)); }
  } catch {}
  if (ctx.agent.isStreaming)
    return sendJson(res, 409, { error: 'agent is in the middle of a turn. Wait for it to finish, then try again.' });
  try {
    await ctx.agent.sendRpc('new_session', {}, 15000);
    ctx.agent.state.messageCount = 0;
    ctx.agent.state.sessionName = null;
    if (projectDir) ctx.agent.pendingProject = projectDir; // flushed on first send
    if (ctx.follow && ctx.follow.isOn()) { try { ctx.follow.stop(); } catch {} }
    ctx.agent.applyGetState();
    ctx.agent.broadcast({ type: 'system', note: 'new session' + (projectDir ? ' in ' + labelOf(projectDir) : '') });
    sendJson(res, 200, { ok: true, project: projectDir || null });
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
};

const resumeSession = async (rel, ctx) => {
  if (ctx.agent.isStreaming)
    return { error: 'agent is working on a turn – Stop it first, then retry' };
  const full = S.resolveSession(rel);
  if (!full) return { error: 'bad session file' };
  try {
    const r = await ctx.agent.sendRpc('switch_session', { sessionPath: full }, 20000);
    if (r.data && r.data.cancelled) return { error: 'switch cancelled by extension' };
    ctx.agent.state.messageCount = 0; // force chat to re-load messages from the switched session
    ctx.agent.state.sessionName = S.titleOfFile(full) || ctx.agent.state.sessionName;
    ctx.agent.applyGetState();
    ctx.agent.broadcast({ type: 'system', note: 'now replying in: ' + rel });
    return { ok: true, project: S.decodeProject(rel.split('/')[0]) };
  } catch (e) {
    return { error: String(e.message || e) };
  }
};

const postLevel = async (req, res, ctx) => {
  try {
    const r = await ctx.agent.sendRpc('cycle_thinking_level', {}, 5000);
    const st = r.data || {};
    ctx.agent.state.thinkingLevel = st.level ?? ctx.agent.state.thinkingLevel;
    ctx.agent.broadcast({ type: 'thinking_level_changed', level: ctx.agent.state.thinkingLevel });
    sendJson(res, 200, { ok: true, level: ctx.agent.state.thinkingLevel });
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
};

// ---------------------------------------------------------------- main router
async function handleApi(req, res, baseUrl, ctx) {
  const url = new URL(req.url, baseUrl);
  const p = url.pathname === '/' ? '/p/' + PAGE_VER : url.pathname;
  // stale /p/<OLD_VER> bookmarks (from a previous page build): redirect to the
  // current page instead of 404ing. Old URLs may still be bookmarked on phones.
  if (url.pathname === '/' || url.pathname === '/p/' ||
      (/^\/p\/[^/]+$/.test(url.pathname) && url.pathname !== '/p/' + PAGE_VER)) {
    const q = url.search ? url.search : '';
    res.writeHead(302, { 'location': '/p/' + PAGE_VER + q, 'cache-control': 'no-store' });
    return res.end();
  }
  const api = p.startsWith('/api/');
  if (api && !ctx.auth.PUBLIC_API.has(p) && !ctx.auth.isAuthed(req, url)) {
    return sendJson(res, 403, { error: 'bad token' });
  }

  // ---- phone-side diagnostics (public, append-only): the UI's boot script and
  // any on-screen "stuck" probe POST here and we stash the blob in diag.log
  // for post-mortems. No auth, no size surprises (truncated to 1500 chars).
  if (p === '/api/diag' && req.method === 'POST') {
    readBody(req)
      .then((t) => {
        t = String(t).slice(0, 1500);
        try { fs.appendFileSync(CFG.diagLog, '[' + new Date().toISOString() + '] ' + t + '\n'); } catch {}
        console.error('[DIAG] ' + t);
        sendJson(res, 200, { ok: 1 });
      })
      .catch(() => sendJson(res, 500, { error: 'body' }));
    return;
  }

  // ---- synthetic static endpoints (see src/static.js)
  if (p === '/bundle.meta') {
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    return res.end(require('./static.js').bundleMeta());
  }
  if (p === '/app.bundle.js.sha256') {
    res.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-store' });
    return res.end(bundleSha());
  }

  // ---- agent state / conversation
  if (p === '/api/health') return sendJson(res, 200, { ok: 1, state: ctx.agent.publicState() });
  if (p === '/api/state') return sendJson(res, 200, { state: ctx.agent.publicState(), seq: ctx.sequencer() });
  if (p === '/api/messages') {
    ctx.agent
      .sendRpc('get_messages')
      .then((r) => sendJson(res, 200, { messages: (r.data && r.data.messages) || [] }))
      .catch((e) => sendJson(res, 500, { error: String(e.message || e) }));
    return;
  }
  if (p === '/api/poll') return handlePoll(req, res, url, ctx);
  if (p === '/api/send' && req.method === 'POST') return handleSend(req, res, ctx);
  if (p === '/api/abort' && req.method === 'POST') return postAbort(req, res, ctx);
  if (p === '/api/new-session' && req.method === 'POST') return postNewSession(req, res, ctx);
  if (p === '/api/resume' && req.method === 'POST') {
    const b = await readBody(req).then((x) => {
      try { return JSON.parse(x); } catch { return {}; }
    });
    const r = await resumeSession(b.file, ctx);
    return sendJson(res, r.error ? 400 : 200, r);
  }
  if (p === '/api/level' && req.method === 'POST') return postLevel(req, res, ctx);

  // ---- Web Push (VAPID/ECE)
  if (p === '/api/push/vapid-key') return sendJson(res, 200, { publicKey: ctx.push.VAPID.publicKey });
  if (p === '/api/push/subscribe' && req.method === 'POST')
    return readBody(req)
      .then(function (bt) {
        var b = {};
        try { b = JSON.parse(bt || '{}'); } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }
        if (!b.endpoint || !b.keys || !b.keys.p256dh || !b.keys.auth)
          return sendJson(res, 400, { error: 'bad subscription' });
        ctx.push.pushSubs.set(b.endpoint, b);
        ctx.push.savePushSubs();
        console.error('[pibridge] web-push subscribe (' + ctx.push.pushSubs.size + ' subs)');
        sendJson(res, 200, { ok: true, count: ctx.push.pushSubs.size });
      });
  if (p === '/api/push/unsubscribe' && req.method === 'POST')
    return readBody(req)
      .then(function (bt) {
        var b = {};
        try { b = JSON.parse(bt || '{}'); } catch (e) {}
        if (b.endpoint) {
          ctx.push.pushSubs.delete(b.endpoint);
          ctx.push.savePushSubs();
        }
        sendJson(res, 200, { ok: true, count: ctx.push.pushSubs.size });
      });

  // ---- sessions / follow
  if (p === '/api/sessions') {
    if (req.method === 'POST') {
      (async () => {
        let b = {};
        try {
          b = JSON.parse((await readBody(req)) || '{}');
        } catch {
          return sendJson(res, 400, { error: 'bad json' });
        }
        let files = Array.isArray(b.delete) ? b.delete : (b.delete ? [b.delete] : null);
        if (b.move && b.move.to) {
          // Move one or more session files into a different (project) group.
          const froms = Array.isArray(b.move.from) ? b.move.from : [b.move.from];
          const to = String(b.move.to);
          const moved = [];
          const errors = [];
          for (const rel of froms) {
            const r = String(rel);
            try {
              const m = S.moveSession(r, to);
              moved.push(m.to);
              if (ctx.follow.follow.on && ctx.follow.follow.file === r) ctx.follow.stopFollow('session moved from phone');
            } catch (e) { errors.push(r + ' (' + e.message + ')'); }
          }
          sendJson(res, 200, { ok: true, moved, errors });
          return;
        }
        if (files) {
          const activeRel =
            ctx.agent.state.sessionId &&
            S.filenameForSessionId(ctx.agent.state.sessionId);
          let deleted = [];
          const errors = [];
          for (const rel of files) {
            const r = String(rel);
            const full = S.resolveSession(r);
            if (!full) { errors.push(r); continue; }
            if (activeRel && full.endsWith('_' + ctx.agent.state.sessionId + '.jsonl')) { errors.push(r + ' (active)'); continue; }
            if (ctx.follow.follow.on && ctx.follow.follow.file === r) ctx.follow.stopFollow('session deleted from phone');
            try { fs.unlinkSync(full); deleted.push(r); } catch (e) { errors.push(r + ' (' + e.message + ')'); }
          }
          if (deleted.length) console.error('[pibridge] deleted ' + deleted.length + ' session file(s)');
          sendJson(res, 200, { ok: true, deleted, errors });
          return;
        }
        if (b.follow) {
          const r = ctx.follow.startFollow(b.follow, b.ongoing);
          sendJson(
            res,
            r.error ? 400 : 200,
            r.error ? { error: r.error } : { ok: true, follow: ctx.follow.publicFollow() }
          );
        } else {
          ctx.follow.stopFollow('stopped from phone');
          sendJson(res, 200, { ok: true, follow: ctx.follow.publicFollow() });
        }
      })();
      return;
    }
    sendJson(res, 200, { follow: ctx.follow.publicFollow(), sessions: S.readHead() });
    return;
  }

  // ---- reusable prompt templates (one-shot, distinct from the static agent-file
  // templates above). Stored as ~/.config/pibridge/templates/<name>.md.
  if (p === '/api/prompt-templates') {
    if (req.method === 'POST') {
      return readBody(req).then((t) => {
        let b = {};
        try { b = JSON.parse(t || '{}'); } catch {
          return sendJson(res, 400, { error: 'bad json' });
        }
        if (b.delete) {
          let err = null;
          try { S.deletePromptTemplate(String(b.delete)); } catch (e) { err = String(e.message || e); }
          return sendJson(res, err ? 400 : 200, err ? { error: err } : { ok: true });
        }
        const name = String(b.name || '');
        if (!name) return sendJson(res, 400, { error: 'name required' });
        if (typeof b.body !== 'string') return sendJson(res, 400, { error: 'body required (string)' });
        let err = null;
        try { S.savePromptTemplate(name, b.body); } catch (e) { err = String(e.message || e); }
        if (err)
          return sendJson(res, 400, { error: err });
        sendJson(res, 200, { ok: true, names: S.listPromptTemplates() });
      });
    }
    sendJson(res, 200, { names: S.listPromptTemplates() });
    return;
  }
  if (p === '/api/prompt-template') {
    const name = url.searchParams.get('name');
    const body = S.getPromptTemplate(name);
    if (body === null) return sendJson(res, 404, { error: 'no such template' });
    sendJson(res, 200, { name, body });
    return;
  }
  if (p === '/api/session-view') {
    const rel = url.searchParams.get('file');
    const msgs = S.parseSessionMessages(rel);
    if (msgs === null) return sendJson(res, 400, { error: 'bad session file' });
    const meta = S.readHead().find((x) => x.file === rel) || {};
    sendJson(res, 200, {
      file: rel,
      dir: meta.dir || null,
      project: meta.project || null,
      title: meta.title || null,
      messages: msgs,
    });
    return;
  }

  // ---- per-project agent files (agent_instructions.md / agent_backlog.md)
  if (p === '/api/agent-templates') {
    if (req.method === 'POST') {
      return readBody(req)
        .then((t) => {
          let b = {};
          try {
            b = JSON.parse(t || '{}');
          } catch (_) {
            return sendJson(res, 400, { error: 'bad json' });
          }
          for (const k of Object.keys(AGENT_FILE_KEYS)) {
            if (typeof b[k] !== 'string') return sendJson(res, 400, { error: 'template.' + k + ' required (string)' });
            AGENT_TEMPLATES[k] = b[k].slice(0, 200000);
          }
          if (!agentSaveTemplates()) return sendJson(res, 500, { error: 'could not save templates on disk' });
          console.error('[pibridge] agent templates updated');
          return sendJson(res, 200, { ok: true, templates: AGENT_TEMPLATES });
        });
    }
    return sendJson(res, 200, { templates: AGENT_TEMPLATES });
  }
  if (p === '/api/agent-files') {
    const urlq = url.searchParams;
    const k = urlq.get('key');
    const d = urlq.get('dir');
    if (!AGENT_FILE_KEYS[k])
      return sendJson(res, 400, { error: "unknown file key (use 'instructions' or 'backlog')" });
    if (req.method === 'GET') {
      const cwd = agentProjectCwdOrReply(res, d, sendJson);
      if (!cwd) return;
      const file = path.join(cwd, AGENT_FILE_KEYS[k]);
      let exists = false,
          content = '';
      try {
        exists = fs.statSync(file).isFile();
      } catch (_) {}
      if (exists) {
        try {
          content = fs.readFileSync(file, 'utf8').slice(0, 1000000);
        } catch (e) {
          return sendJson(res, 500, { error: 'read failed: ' + (e.message || e) });
        }
      }
      return sendJson(res, 200, { key: k, file: AGENT_FILE_KEYS[k], exists, content, cwd });
    }
    if (req.method === 'POST') {
      return readBody(req)
        .then((t) => {
          let b = {};
          try {
            b = JSON.parse(t || '{}');
          } catch (_) {
            return sendJson(res, 400, { error: 'bad json' });
          }
          const cwd = agentProjectCwdOrReply(res, d, sendJson);
          if (!cwd) return;
          const fromTpl = !!b.fromTemplate;
          const content = (fromTpl ? AGENT_TEMPLATES[k] : String(b.content == null ? '' : b.content)).slice(0, 1000000);
          const fPath = path.join(cwd, AGENT_FILE_KEYS[k]);
          try {
            fs.writeFileSync(fPath, content, 'utf8');
          } catch (e) {
            return sendJson(res, 500, { error: 'write failed: ' + (e.message || e) });
          }
          console.error('[pibridge] saved ' + fPath + (fromTpl ? ' (from template)' : ''));
          return sendJson(res, 200, { ok: true, exists: true, file: AGENT_FILE_KEYS[k], cwd });
        });
    }
    return sendJson(res, 405, { error: 'method not allowed' });
  }

  // ---- notifications
  if (p === '/api/notify-prefs') {
    if (req.method === 'POST') {
      return (async () => {
        let parsed = {};
        try { parsed = JSON.parse((await readBody(req)) || '{}'); } catch {}
        const res2 = ctx.notify.setPrefs({ phone: !!parsed.phone, inpage: !!parsed.inpage });
        return sendJson(res, 200, { ok: true, prefs: res2 });
      })();
    }
    return sendJson(res, 200, { prefs: ctx.notify.getPrefs() });
  }
  if (p === '/api/test-notify' && req.method === 'GET') {
    ctx.notify.addNotif(
      'pi (PC) → test notification',
      'Notification pipeline is working. ' + new Date().toLocaleTimeString()
    );
    return sendJson(res, 200, { ok: true });
  }
  if (p === '/api/notify') {
    ctx.notify.waitNotify(res, Math.min(15000, Number(url.searchParams.get('timeout')) || 12000), sendJson);
    return;
  }

  // ---- static UI (see src/static.js)
  const st = ctx.staticRoutes[p];
  if (st && st.file) {
    const f = path.join(ctx.staticBasePath, st.file);
    if (!fs.existsSync(f)) {
      res.writeHead(404);
      return res.end('nf');
    }
    res.writeHead(200, { 'content-type': st.type, 'cache-control': 'no-store' });
    return res.end(fs.readFileSync(f));
  }
  if (api) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    return res.end('not found');
  }
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset=utf-8><title>404</title><body style=background:#0f1115;color:#e6e9ef;font:16px system-ui;display:flex;height:100vh;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:20px><h2>not found: ' + p.replace(/["<>&]/g, '') + '</h2><p>the page moved or the link is stale</p><a href="/p/' + PAGE_VER + '" style=color:#6ea8fe;font-size:18px>↩ go to the bridge</a>');
}

// ------------------------------------------------------------------ access log
function accessLog(req, res) {
  const clean = (() => {
    try {
      const p = new URL(req.url, 'http://x');
      return p.pathname + (Object.keys(p.searchParams).length ? '?' + [...p.searchParams.keys()].join(',') : '');
    } catch {
      return '?';
    }
  })();
  const t0 = Date.now();
  let noted = false;
  const origEnd = res.end.bind(res);
  res.end = (...args) => {
    if (!noted) {
      noted = true;
      try {
        fs.appendFileSync(CFG.accessLog, `[${new Date().toISOString()}] ${req.socket.remoteAddress} ${req.method} ${clean} -> ${res.statusCode} ${Date.now() - t0}ms\n`);
      } catch {}
    }
    return origEnd(...args);
  };
  res.on('close', () => {
    if (!noted) {
      noted = true;
      try {
        fs.appendFileSync(CFG.accessLog, `[${new Date().toISOString()}] ${req.socket.remoteAddress} ${req.method} ${clean} -> ${res.statusCode ?? '?'} ${Date.now() - t0}ms (aborted)`);
      } catch {}
    }
  });
}

module.exports = { handleApi, accessLog, sendJson };
