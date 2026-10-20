'use strict';
/**
 * index.js — the entry point. Wires every module together and starts the
 * HTTP(S) servers. It has no domain logic of its own; it just:
 *
 *   1. loads the config (config.js) and the token (auth.js)
 *   2. builds the follow + agent controllers (the one place that owns the live
 *      `follow` state object that both the agent's publicState() and the HTTP
 *      handlers read from)
 *   3. assembles the `ctx` bundle the HTTP handlers read from
 *   4. listens: always HTTP on `--port`, plus HTTPS on 8443 when cert/key are
 *      set, and finally spawns the pi child.
 *
 * The `server.js` file at the repo root is a two-line shim that requires this
 * file, so the systemd unit (`node .../server.js --port 8787`) keeps working
 * unchanged.
 */
const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');

const { CFG, tailnetIp, tailnetName, pickHost } = require('./config.js');
const auth = require('./auth.js');
const S = require('./sessions.js');
const P = require('./push.js');
const N = require('./notify.js');
const St = require('./static.js');
const H = require('./handlers.js');
const { createAgent } = require('./agent.js');
const { createFollow } = require('./follow.js');

function main() {
  // ------------------------------------------------------------ follow
  // The follow controller owns the live `follow` state object. The agent's
  // publicState() reads it, and the HTTP handlers call followCtl.* for the
  // resume/follow mutations.
  const followCtl = createFollow({
    onNotif: N.addNotif,
    filenameForSessionId: S.filenameForSessionId,
  });
  const follow = followCtl.follow;

  // ------------------------------------------------------------ agent
  const agent = createAgent({
    follow,
    sessionsTitle: (file) => S.titleOfFile(S.resolveSession(file)),
    filenameForSessionId: S.filenameForSessionId,
    autoFollow: (sid) => followCtl.autoFollow(sid),
  });

  // Keep the "needs your input" watcher pointed at whichever transcript pi is
  // active in, re-evaluated every 2 s (a cheap no-op unless the session
  // changed). One extra pass 3 s in so a *resumed* session is watched right away.
  setInterval(() => {
    try {
      followCtl.autoFollow(agent.state.sessionId);
    } catch {}
  }, 2000);
  setTimeout(() => {
    try {
      followCtl.autoFollow(agent.state.sessionId);
    } catch {}
  }, 3000);

  // ------------------------------------------------------------ ctx bundle
  const ctx = {
    agent,
    follow: followCtl,
    notify: N,
    auth,
    push: P,
    staticBasePath: St.UI_DIR,
    staticRoutes: St.staticRouteMap(),
    sequencer: () => agent.seq,
  };

  // ------------------------------------------------------------ request router
  // (accessLog is bound per-response; it wraps res.end to capture the final
  //  status + latency and append to access.log before delegating.)
  const handler = (req, res) => {
    H.accessLog(req, res);
    const m = req.method;
    if (m !== 'GET' && m !== 'HEAD' && m !== 'POST') {
      res.writeHead(405, { 'content-type': 'text/plain' });
      return res.end('method not allowed');
    }
    let base;
    try {
      const host = String(req.headers.host || '127.0.0.1');
      base = (req.socket.encrypted ? 'https://' : 'http://') + host;
    } catch {
      base = 'http://' + String(req.headers.host || '127.0.0.1');
    }
    H.handleApi(req, res, base, ctx).catch((r) => {
      try {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end('{"error":"' + String(r.message || r).replace(/"/g, '\\"') + '"}');
      } catch {}
    });
  };

  // ------------------------------------------------------------ HTTP servers
  const httpSrv = http.createServer(handler);
  const listenHttp = () => {
    const bound = pickHost();
    httpSrv.listen(CFG.port, bound, () => {
      const t = tailnetIp(),
        hn = tailnetName();
      console.error('[pibridge] listening on ' + (bound === '0.0.0.0' ? '* (all interfaces)' : bound) + ':' + CFG.port);
      console.error('[pibridge] phone UI:  http://' + (t || '(LAN IP)') + ':' + CFG.port + '/   (token ' + auth.TOKEN.slice(0, 4) + '… ; full value in ' + CFG.tokenFile + ')');
      if (hn) console.error('[pibridge] tailnet:   ' + hn + '  @ ' + (t || '(no IP)'));
      if (!CFG.cert && !CFG.key)
        console.error('[pibridge] NOTE: Web Push needs HTTPS. Set PIBRIDGE_CERT / PIBRIDGE_KEY to open the :8443 TLS listener.');
    });
  };
  httpSrv.on('error', (e) => {
    console.error('[pibridge] server error: ' + e.message);
    setTimeout(listenHttp, 8000);
  });
  listenHttp();

  let httpsSrv = null;
  if (CFG.cert && CFG.key) {
    try {
      httpsSrv = https.createServer(
        { key: fs.readFileSync(CFG.key), cert: fs.readFileSync(CFG.cert) },
        handler
      );
      httpsSrv.listen(CFG.httpsPort, '0.0.0.0', () => {
        const t = tailnetIp(),
          hn = tailnetName();
        console.error('[pibridge] HTTPS on *:8443   https://' + (t || '(LAN IP)') + ':8443/' + (hn ? '  (tailnet ' + hn + ')' : ''));
      });
      // A busy :8443 (e.g. a second instance, or the real service already bound it)
      // must not take the whole process down — degrade to HTTP only.
      httpsSrv.on('error', (e) => {
        console.error('[pibridge] HTTPS listener failed (continuing HTTP-only): ' + e.message);
      });
    } catch (e) {
      console.error('[pibridge] could not enable HTTPS on :8443 – check PIBRIDGE_CERT / PIBRIDGE_KEY (' + ((e && e.message) || e) + ')');
    }
  } else {
    console.error('[pibridge] NOTE: Web Push needs HTTPS. Set PIBRIDGE_CERT / PIBRIDGE_KEY to open the :8443 TLS listener.');
  }

  // ------------------------------------------------------------ start the pi child
  agent.start();

  // ------------------------------------------------------------ graceful shutdown
  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.error('\n[pibridge] shutting down');
    agent.stop();
    if (followCtl.follow.timer) clearInterval(followCtl.follow.timer);
    for (const p of agent.pollers) {
      try {
        p.close();
      } catch {}
    }
    setTimeout(() => process.exit(0), 200).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = { main };

// Auto-start when run directly (or via the server.js shim, which is require.main).
if (require.main === module) main();
