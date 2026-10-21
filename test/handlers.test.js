#!/usr/bin/env node
'use strict';
/*
 * Integration test: spin up a real HTTP server wired to handleApi() with a
 * stub runtime ctx, against an ISOLATED temp session/temp dir (via env, so the
 * real ~/.pi store is never touched). Exercises /api/sessions (list / move /
 * bulk delete) and /api/prompt-templates end-to-end over HTTP.
 *
 *   node --test test/handlers.test.js
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

// Override the stores BEFORE config is loaded (it reads env once at require).
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'pib-int-'));
const SESSIONS = path.join(HOME, 'sessions');
const TEMPLATES = path.join(HOME, 'templates');
fs.mkdirSync(SESSIONS, { recursive: true });
process.env.PIBRIDGE_SESSIONS_DIR = SESSIONS;
process.env.PIBRIDGE_TEMPLATES_DIR = TEMPLATES;

const { handleApi } = require('../src/handlers.js');

let port = 0;
let base;
function mkCtx() {
  return {
    auth: { PUBLIC_API: new Set(), isAuthed: () => true },
    agent: { state: { sessionId: null }, publicState: () => ({ ok: 1 }), broadcast() {}, sendRpc: async () => ({ data: {} }), applyGetState() {} },
    follow: { follow: { on: false, file: null }, startFollow: () => ({ error: 'no' }), stopFollow() {}, publicFollow: () => ({ on: false }) },
    push: { VAPID: { publicKey: 'x' }, subs: [] },
    notify: {},
    sequencer: () => 0,
    staticRoutes: new Map(),
    staticBasePath: path.join(__dirname, '..', 'components'),
    cfg: {},
  };
}
const server = http.createServer((req, res) => handleApi(req, res, base, mkCtx()));

function req(method, p, body) {
  return fetch(base + p, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({ status: r.status, body: await r.json() }));
}
function w(rel, s) {
  const full = path.join(SESSIONS, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, s);
}

test.before(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
  base = 'http://127.0.0.1:' + port;
  // seed three sessions across two projects (two in alpha, one in beta)
  w('alpha/2026-01-01T00:00:00.000Z_old.jsonl', JSON.stringify({ message: { role: 'user', content: [{ type: 'text', text: 'old alpha' }] }}) + '\n');
  w('alpha/2026-01-05T00:00:00.000Z_new.jsonl', JSON.stringify({ message: { role: 'user', content: [{ type: 'text', text: 'new alpha' }] }}) + '\n');
  w('beta/2026-01-02T00:00:00.000Z_beta.jsonl', JSON.stringify({ message: { role: 'user', content: [{ type: 'text', text: 'beta one' }] }}) + '\n');
});
test.after(() => { server.close(); fs.rmSync(HOME, { recursive: true, force: true }); });

test('GET /api/sessions lists every transcript with decoded project + mtime order', async () => {
  const { status, body } = await req('GET', '/api/sessions');
  assert.strictEqual(status, 200);
  assert.strictEqual(body.sessions.length, 3);
  assert.ok(body.sessions.every((s) => s.project)); // decoded, not dash-encoded
  // newest-first overall
  assert.strictEqual(body.sessions[0].file, 'alpha/2026-01-05T00:00:00.000Z_new.jsonl');
});

test('POST /api/sessions {move} moves a session into another group', async () => {
  const r = await req('POST', '/api/sessions', { move: { from: 'alpha/2026-01-05T00:00:00.000Z_new.jsonl', to: 'beta' } });
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(r.body.moved, ['beta/2026-01-05T00:00:00.000Z_new.jsonl']);
  assert.deepStrictEqual(r.body.errors, []);
  assert.ok(fs.existsSync(path.join(SESSIONS, 'beta/2026-01-05T00:00:00.000Z_new.jsonl')));
  assert.ok(!fs.existsSync(path.join(SESSIONS, 'alpha/2026-01-05T00:00:00.000Z_new.jsonl')));
});

test('POST /api/sessions {delete:[...]} bulk-deletes, skipping the active session', async () => {
  // seed two more, mark one as the "active" session to prove it is preserved
  w('gamma/2026-02-01T00:00:00.000Z_keepme.jsonl', JSON.stringify({ message: { role: 'user', content: [{ type: 'text', text: 'active' }] }}) + '\n');
  w('gamma/2026-02-02T00:00:00.000Z_dropme.jsonl', JSON.stringify({ message: { role: 'user', content: [{ type: 'text', text: 'droppable' }]}}) + '\n');
  // the active-session guard resolves through ctx.agent.state.sessionId, so
  // spin up a server with a ctx that "has" a session id and assert skip.
  const srv2 = http.createServer((req, res) => handleApi(req, res, base, { ...mkCtx(), agent: { ...mkCtx().agent, state: { sessionId: 'keepme' } } }));
  await new Promise((r) => srv2.listen(0, '127.0.0.1', r));
  const b2 = 'http://127.0.0.1:' + srv2.address().port;
  const r2 = await fetch(b2 + '/api/sessions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ delete: ['gamma/2026-02-02T00:00:00.000Z_dropme.jsonl', 'gamma/2026-02-01T00:00:00.000Z_keepme.jsonl'] }) });
  const j2 = await r2.json(); srv2.close();
  assert.ok(j2.deleted.includes('gamma/2026-02-02T00:00:00.000Z_dropme.jsonl'));
  assert.ok(j2.errors.some((e) => e.includes('(active)')));
  assert.ok(fs.existsSync(path.join(SESSIONS, 'gamma/2026-02-01T00:00:00.000Z_keepme.jsonl')));
  assert.ok(!fs.existsSync(path.join(SESSIONS, 'gamma/2026-02-02T00:00:00.000Z_dropme.jsonl')));

  // plain (no active) bulk delete still works
  w('d2/a/2026-03-01T00:00:00.000Z_x.jsonl', 'x'); 
  w('d2/b/2026-03-02T00:00:00.000Z_y.jsonl', 'y');
  const r = await req('POST', '/api/sessions', { delete: ['d2/a/2026-03-01T00:00:00.000Z_x.jsonl', 'd2/b/2026-03-02T00:00:00.000Z_y.jsonl'] });
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(r.body.deleted.sort(), ['d2/a/2026-03-01T00:00:00.000Z_x.jsonl', 'd2/b/2026-03-02T00:00:00.000Z_y.jsonl']);
  assert.deepStrictEqual(r.body.errors, []);
});

test('prompt templates save / list / get / delete over HTTP', async () => {
  let r = await req('POST', '/api/prompt-templates', { name: 'review', body: 'please review my diff' });
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(r.body.names, ['review']);

  r = await req('GET', '/api/prompt-template?name=review');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.body.body, 'please review my diff');

  r = await req('POST', '/api/prompt-templates', { delete: 'review' });
  assert.strictEqual(r.status, 200);
  assert.strictEqual((await req('GET', '/api/prompt-template?name=review')).status, 404);
});

test('prompt template rejects blank name and bad json', async () => {
  assert.strictEqual((await req('POST', '/api/prompt-templates', { name: '', body: 'x' })).status, 400);
  // body must be a string
  assert.strictEqual((await req('POST', '/api/prompt-templates', { name: 'x', body: 5 })).status, 400);
});
