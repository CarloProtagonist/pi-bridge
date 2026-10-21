#!/usr/bin/env node
"use strict";
/*
 * node --test suite for pi-bridge (zero-dependency).
 *
 * Exercises the pure, Node-built-in-only logic in src/sessions.js and the
 * prompt-template helpers. Tests run against throwaway temp dirs so the real
 * ~/.pi session store is never touched.
 *
 *   node --test test/
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const S = require('../src/sessions.js');

// ---- scratch helpers ------------------------------------------------------
function tmpd() { return fs.mkdtempSync(path.join(os.tmpdir(), 'pib-')); }
function wfile(p, s) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }
function sessLine(role, { text, ts } = {}) {
  return JSON.stringify({ type: 'message', timestamp: ts || new Date().toISOString(), message: { role, content: text ? [{ type: 'text', text }] : [] } });
}

// ---- decodeProject --------------------------------------------------------
test('decodeProject: dash-encoded dir → decoded path', () => {
  assert.strictEqual(S.decodeProject('--home-crispy-pi-bridge--'), '/home/crispy/pi/bridge');
  assert.strictEqual(S.decodeProject('src-app-js'), '/src/app/js');
  assert.strictEqual(S.decodeProject('home-crispy'), '/home/crispy');
});

// ---- resolveSession -------------------------------------------------------
test('resolveSession: maps rel path inside sessions dir', () => {
  const base = tmpd();
  const f = path.join(base, 'proj', '2026-01-01T00:00:00.000Z_abc.jsonl');
  wfile(f, '');
  const got = S.resolveSession('proj/2026-01-01T00:00:00.000Z_abc.jsonl', base);
  assert.strictEqual(got, f);
  fs.rmSync(base, { recursive: true, force: true });
});
test('resolveSession: rejects "..", missing, and non-file targets', () => {
  const base = tmpd();
  const f = path.join(base, 'proj', '2026-01-01T00:00:00.000Z_abc.jsonl');
  wfile(f, '');
  assert.strictEqual(S.resolveSession('proj/..%2F..%2Fetc%2Fpasswd', base), null);
  assert.strictEqual(S.resolveSession('proj/../x.jsonl', base), null);
  assert.strictEqual(S.resolveSession('missing.jsonl', base), null);
  assert.strictEqual(S.resolveSession('proj', base), null); // dir, not file
  assert.strictEqual(S.resolveSession('', base), null);
  fs.rmSync(base, { recursive: true, force: true });
});

// ---- readHead -------------------------------------------------------------
test('readHead: lists newest-first within each project and extracts title', () => {
  const base = tmpd();
  // project "alpha": two sessions, older then newer (newer = later mtime)
  const a1 = path.join(base, 'alpha', '2026-01-01T00:00:00.000Z_a.jsonl');
  const a2 = path.join(base, 'alpha', '2026-01-02T00:00:00.000Z_b.jsonl');
  wfile(a1, sessLine('user', { text: 'older question' }) + '\n');
  wfile(a2, sessLine('user', { text: 'newer question' }) + '\n');
  // force newer mtime on a2 (and older on a1) so mtime-order is unambiguous
  const t1 = new Date('2026-01-01'), t2 = new Date('2026-01-02');
  fs.utimesSync(a1, t1, t1); fs.utimesSync(a2, t2, t2);
  // project "beta": one session
  const b1 = path.join(base, 'beta', '2026-01-03T00:00:00.000Z_c.jsonl');
  wfile(b1, sessLine('user', { text: 'beta only' }) + '\n');
  const t3 = new Date('2026-01-03'); fs.utimesSync(b1, t3, t3);

  const rows = S.readHead(base);
  assert.strictEqual(rows.length, 3);
  const byProj = {};
  for (const r of rows) (byProj[r.project] ||= []).push(r.file);
  // project names are decoded paths → '/alpha', '/beta'
  assert.strictEqual(byProj['/beta'].length, 1);
  assert.deepStrictEqual(byProj['/alpha'], [
    'alpha/2026-01-02T00:00:00.000Z_b.jsonl', // newer first
    'alpha/2026-01-01T00:00:00.000Z_a.jsonl',
  ]);
  // newest mtime overall first
  assert.strictEqual(rows[0].file, 'beta/2026-01-03T00:00:00.000Z_c.jsonl');
  // title extracted from first non-system user message
  const hit = rows.find(r => r.file === 'alpha/2026-01-02T00:00:00.000Z_b.jsonl');
  assert.strictEqual(hit.title, 'newer question');
  fs.rmSync(base, { recursive: true, force: true });
});
test('readHead: skips files without a session-ish name', () => {
  const base = tmpd();
  const bad = path.join(base, 'x', 'notes.txt'); wfile(bad, 'x');
  const good = path.join(base, 'x', '2026-01-01T00:00:00.000Z_z.jsonl');
  wfile(good, sessLine('user', { text: 'hi' }) + '\n');
  const rows = S.readHead(base);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].file, 'x/2026-01-01T00:00:00.000Z_z.jsonl');
  fs.rmSync(base, { recursive: true, force: true });
});

// ---- parseSessionMessages -------------------------------------------------
test('parseSessionMessages: folds tools + thinking, drops toolResult/system, trims text', () => {
  const base = tmpd();
  const lines = [
    JSON.stringify({ type: 'compaction', timestamp: 'T0', summary: 'compacted earlier' }),
    sessLine('user', { text: 'hello', ts: 'T1' }),
    JSON.stringify({ type: 'message', timestamp: 'T2', message: { role: 'assistant', content: [
      { type: 'thinking', thinking: 'hmm…' },
      { type: 'toolCall', name: 'bash', id: 'c1', input: {} },
      { type: 'toolCall', name: 'read', id: 'c2', input: {} },
      { type: 'text', text: 'did stuff' },
    ] } }),
    JSON.stringify({ type: 'message', timestamp: 'T3', message: { role: 'toolResult', content: [] } }),
    JSON.stringify({ type: 'message', timestamp: 'T4', message: { role: 'system', content: [] } }),
    sessLine('assistant', { text: 'second reply', ts: 'T5' }),
  ].join('\n') + '\n';
  wfile(path.join(base, 'x', '2026-01-01T00:00:00.000Z_z.jsonl'), lines);
  const msgs = S.parseSessionMessages('x/2026-01-01T00:00:00.000Z_z.jsonl', {}, base);
  assert.deepStrictEqual(msgs.map(m => m.role), ['info', 'user', 'assistant', 'assistant']);
  assert.match(msgs[0].text, /compacted/);
  assert.deepStrictEqual(msgs[2].tools, ['bash', 'read']);
  assert.strictEqual(msgs[2].thinking, 'hmm…');
  assert.strictEqual(msgs[2].text, 'did stuff');
  assert.strictEqual(msgs[3].text, 'second reply');
  fs.rmSync(base, { recursive: true, force: true });
});
test('parseSessionMessages: strips <system> user blocks and truncates very long messages', () => {
  const base = tmpd();
  const lines = [
    sessLine('user', { text: '<system>secret context</system>' }),
    sessLine('user', { text: 'keep me ' + 'x'.repeat(9000) }),
  ].join('\n');
  wfile(path.join(base, 'x', '2026-01-01T00:00:00.000Z_z.jsonl'), lines);
  const msgs = S.parseSessionMessages('x/2026-01-01T00:00:00.000Z_z.jsonl', {}, base);
  assert.strictEqual(msgs.length, 1);
  assert.strictEqual(msgs[0].role, 'user');
  assert.strictEqual(msgs[0].text.length, 8000);
  fs.rmSync(base, { recursive: true, force: true });
});

// ---- agentResolveProject --------------------------------------------------
test('agentResolveProject: resolves encoded dir to the real cwd from line one', () => {
  const base = tmpd();
  const proj = tmpd(); // the "real" working directory
  const enc = path.join(base, 'zzz-proj');
  wfile(path.join(enc, '2026-01-01T00:00:00.000Z_a.jsonl'),
    JSON.stringify({ cwd: proj, message: { role: 'user' } }) + '\n');
  assert.strictEqual(S.agentResolveProject('zzz-proj', base), proj);
  // also accepts a full absolute path (last segment is what counts)
  assert.strictEqual(S.agentResolveProject('full/path/to/zzz-proj', base), proj);
  fs.rmSync(base, { recursive: true, force: true });
  fs.rmSync(proj, { recursive: true, force: true });
});
test('agentResolveProject: null for missing dir, dotted names, and no-cwd files', () => {
  const base = tmpd();
  const real = tmpd();
  assert.strictEqual(S.agentResolveProject('ghost', base), null);
  assert.strictEqual(S.agentResolveProject('..', base), null);
  assert.strictEqual(S.agentResolveProject('.', base), null);
  const enc = path.join(base, 'nocwd');
  wfile(path.join(enc, '2026-01-01T00:00:00.000Z_a.jsonl'), JSON.stringify({ message: {} }) + '\n');
  assert.strictEqual(S.agentResolveProject('nocwd', base), null);
  // cwd points to a path that is not a dir → null
  const enc2 = path.join(base, 'baddir');
  wfile(path.join(enc2, '2026-01-01T00:00:00.000Z_a.jsonl'), JSON.stringify({ cwd: real + '/nope' }) + '\n');
  assert.strictEqual(S.agentResolveProject('baddir', base), null);
  fs.rmSync(base, { recursive: true, force: true });
  fs.rmSync(real, { recursive: true, force: true });
});

// ---- moveSession ----------------------------------------------------------
test('moveSession: moves a file into another project dir', () => {
  const base = tmpd();
  const from = path.join(base, 'alpha', '2026-01-01T00:00:00.000Z_a.jsonl');
  wfile(from, 'd');
  const r = S.moveSession('alpha/2026-01-01T00:00:00.000Z_a.jsonl', 'beta', base);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.to, 'beta/2026-01-01T00:00:00.000Z_a.jsonl');
  assert.ok(fs.existsSync(path.join(base, 'beta', '2026-01-01T00:00:00.000Z_a.jsonl')));
  assert.ok(!fs.existsSync(from));
  fs.rmSync(base, { recursive: true, force: true });
});
test('moveSession: reports noop when source already in target, and rejects bad input', () => {
  const base = tmpd();
  const from = path.join(base, 'alpha', '2026-01-01T00:00:00.000Z_a.jsonl');
  wfile(from, 'd');
  const noop = S.moveSession('alpha/2026-01-01T00:00:00.000Z_a.jsonl', 'alpha', base);
  assert.strictEqual(noop.noop, true);
  assert.throws(() => S.moveSession('ghost/2026-01-01T00:00:00.000Z_x.jsonl', 'beta', base), /not found/);
  assert.throws(() => S.moveSession('alpha/2026-01-01T00:00:00.000Z_a.jsonl', '..', base), /bad target/);
  fs.rmSync(base, { recursive: true, force: true });
});

// ---- prompt templates ------------------------------------------------------
test('prompt templates: save / list / get / delete round-trip (temp dir)', () => {
  const base = tmpd();
  S.savePromptTemplate('review', 'please review', base);
  S.savePromptTemplate('debug', 'trace this', base);
  assert.deepStrictEqual(S.listPromptTemplates(base), ['debug', 'review']);
  assert.strictEqual(S.getPromptTemplate('review', base), 'please review');
  S.deletePromptTemplate('review', base);
  assert.deepStrictEqual(S.listPromptTemplates(base), ['debug']);
  assert.strictEqual(S.getPromptTemplate('review', base), null);
  // overwrite works
  S.savePromptTemplate('debug', 'v2', base);
  assert.strictEqual(S.getPromptTemplate('debug', base), 'v2');
  fs.rmSync(base, { recursive: true, force: true });
});
test('prompt templates: name is validated (no traversal / separators / control chars)', () => {
  const base = tmpd();
  assert.throws(() => S.savePromptTemplate('../x', 'b', base), /bad template name/);
  assert.throws(() => S.savePromptTemplate('a/b', 'b', base), /bad template name/);
  assert.throws(() => S.savePromptTemplate('', 'b', base), /bad template name/);
  assert.throws(() => S.savePromptTemplate('a\nb', 'b', base), /bad template name/);
  assert.strictEqual(S.getPromptTemplate('..%2f..%2fetc', base), null);
  assert.throws(() => S.savePromptTemplate('has space', 'x', base), /bad template name/);
  S.savePromptTemplate('ok-name.1', 'x', base); // dash + dot + digit ok
  assert.strictEqual(S.getPromptTemplate('ok-name.1', base), 'x');
  fs.rmSync(base, { recursive: true, force: true });
});
