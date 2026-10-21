'use strict';
/**
 * static.js — serves the phone UI (index.html / app.js / sw.js) from the
 * `components/` dir, plus two little endpoints the UI's boot code uses to
 * detect a *new* bundle without a cache busting query string:
 *
 *   GET /app.bundle.js.sha256    → first 16 hex of sha256(components/app.js)
 *   GET /app.bundle.js           → the JS file itself
 *
 * The UI's boot script fetches the sha first, injects
 * `<script src="/app.bundle.js?h=<sha>">`, so a changed bundle always gets a
 * different URL and a browser that cached the old one is never served a
 * stale pair. `PAGE_VER` is a static extra layer of cache-busting for the
 * HTML shell.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const UI_DIR = path.join(__dirname, '..', 'components');

// Extract the build tag the UI prints (const BUILD="…") so a phone can compare
// the version of the bundle it actually loaded against the one on disk and
// auto-update when they diverge. Returns "?" if it cannot be found.
function buildTag() {
  try {
    const src = fs.readFileSync(path.join(UI_DIR, 'app.js'), 'utf8');
    const m = src.match(/\bBUILD\s*=\s*"([^"]+)"/);
    return m ? m[1] : '?';
  } catch { return '?'; }
}

const PAGE_VER = 'C103';

// Which path on the wire → which file in UI_DIR. null means "not a real file,
// the handler synthesises the body".
const ROUTES = [
  ['/p/' + PAGE_VER, 'index.html', 'text/html; charset=utf-8'],
  ['/app.bundle.js', 'app.js', 'text/javascript; charset=utf-8'],
  ['/app.bundle.js.sha256', null, null],
  ['/app.js', 'app.js', 'text/javascript; charset=utf-8'],
  ['/sw.js', 'sw.js', 'text/javascript; charset=utf-8'],
];

function staticRouteMap() {
  const m = {};
  for (const [route, file, type] of ROUTES) m[route] = { file, type };
  return m;
}

function bundleSha() {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(UI_DIR, 'app.js')))
    .digest('hex')
    .slice(0, 16);
}

// Small, no-cache JSON the UI fetches on load: {build, sha}. The phone compares
// against its own BUILD and the sha the HTML injected; a mismatch means the page
// was started from an old service-worker cache and should hard-reload.
function bundleMeta() {
  return JSON.stringify({ build: buildTag(), sha: bundleSha(), pageVer: PAGE_VER });
}

module.exports = { PAGE_VER, buildTag, ROUTES, staticRouteMap, bundleSha, bundleMeta, UI_DIR };
