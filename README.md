# pi-bridge
A tiny, **zero-runtime-dependency** Node HTTP server that exposes the `pi`
coding agent running on your PC to your phone: chat with it, live-stream what
it's doing, get a **web-push** (or **ntfy**) notification the moment a turn
finishes or gets stuck, and read or resume old conversations.

Everything runs under one user-level systemd service; the only runtime
dependencies are Node's built-in `node:*` modules (the Web Push +
encrypt-content-encryption crypto is implemented in-tree in
`src/webpush.js` / `src/lib-ece.js`).

**Requires:** Node ≥ 18, a `pi` binary on `PATH`, and (optional) the
[`ntfy`](https://ntfy.sh/) server + Tailscale for push / remote phone access.

---
## Quick start
```bash
cd ~/pi-bridge
node server.js --port 8787
# → prints:  "token (paste into the auth box):  ~/.config/pibridge/token"
```
1. Copy `cat ~/.config/pibridge/token`.
2. From your phone (on the same tailnet or LAN) open
   `http://<tailnet-ip>:8787/`.  The shell auto-redirects to
   `/p/C9[0-9A-Z]/`.
3. Paste the token into the UI's auth box → you're in.

To get **push notifications** working on a phone (Web Push requires HTTPS,
see below):
```bash
./ntfy.sh start            # self-hosted ntfy on :3333, topic "pibridge"
# or, for Web Push, provision tls certs and restart with:
PIBRIDGE_CERT=~/.config/pibridge/tls/cert.pem \
PIBRIDGE_KEY=~/.config/pibridge/tls/key.pem \
node server.js --port 8787
```
Both channels are fanned out from the same `addNotif(title, text)` call in
`src/notify.js`, so whichever one the phone is using will fire.

## CLI & env (the *whole* surface)

| How to set | Name | Default | Meaning |
|---|---|---|---|
| flag / env | `--port N` / `PIBRIDGE_PORT`* | `8787` | HTTP port |
| flag | `--host H` | `0.0.0.0` (via `AUTO`) | Bind address. `AUTO` (default) picks `0.0.0.0` and logs the tailnet IP so you know what to type. |
| flag / file | `--token T` | auto-generated 16-random-hex → `~/.config/pibridge/token` | API password |
| env | `PI_BIN` | `pi` | Path to the `pi` binary |
| env | `PIBRIDGE_CWD` | `process.cwd()` | Working directory of the `pi` child. **Important**: pi writes sessions to `~/.pi/agent/sessions/<cwd-slug>/…`, so change this and your "history" starts in a new bucket. |
| env | `PIBRIDGE_HTTPS_PORT` | `8443` | TLS port (only if cert+key set) |
| env | `PIBRIDGE_CERT` / `PIBRIDGE_KEY` | unset | PEM paths. When **both** are set, a second listener opens on `:8443` serving the identical app over HTTPS — this is required for Web Push in mobile browsers. |
| env | `PIBRIDGE_HTTPS` | unset | If set but no cert/key, print a "push needs HTTPS" notice instead of a full error |

`*` the port can also be given as `PIBRIDGE_PORT` if you prefer env over flags (see `src/config.js`).

**Everything else** on the command line is forwarded **verbatim** to the
`pi --mode rpc` child — so `node server.js --port 8787 --model foo --level
low` still passes `--model foo --level low` straight through to pi.

### Where runtime state lives (all auto-created)
```
~/.config/pibridge/
  token                        # one 48-hex-char API password
  vapid.json                   # auto-generated VAPID keypair (kept across restarts)
  push-subscriptions.json      # every phone that has registered a Web Push push sub
  templates.json               # seed text for "New from template"
  agent-files/<proj>/{agent_instructions.md,agent_backlog.md}
  tls/cert.pem, tls/key.pem    # if you point PIBRIDGE_CERT/KEY at this dir
<repo-root>
  access.log                   # one line per HTTP request (status, latency, method, path)
  diag.log                     # client-side UI diagnostics (POST /api/diag)
  rpc.log                      # raw pi --mode rpc stdout/stderr (troubleshooting)
~/.pi/agent/sessions/<proj-slug>/<ts>-<uuid>.jsonl   # pi's own transcripts
~/.local/share/ntfy-pibridge/{ntfy.pid,ntfy.log,access-token}
```

## The `/api/*` surface (from `src/handlers.js`)

Public (no token):
- `GET  /p/<PAGE_VER>` — the HTML shell (currently `C98`)
- `GET  /app.bundle.js` (+ `/app.bundle.js.sha256`, `/app.js`)
- `GET  /sw.js`
- `GET  /api/health` — liveness; safe to scrape
- `GET  /api/push/vapid-key` — VAPID public key string
- `POST /api/diag` — phone posts a free-form diagnostics blob; appended to `diag.log` (unauthenticated; used by the "Stuck? Run diagnostics" button so you don't have to auth-debug a hung UI)

Everything under `/api/*` (except the two above) requires
`Authorization: Bearer <token>` **or** `?token=<token>`:

| Endpoint | Purpose |
|---|---|
| `GET  /api/state` | One-shot snapshot of the agent (model, level, session, follow state, streaming, etc.) |
| `GET  /api/messages` | Same snapshot *plus* the current conversation |
| `GET  /api/poll?cursor=n` | NDJSON long-poll. Replays the last ≤500 events from the in-memory ring, then streams. Emits a `: hb` comment every 15 s; client gives up after 45 s. |
| `POST /api/send {message, behavior} \| {switchFile}` | Send a turn, or hot-swap which session file the agent follows |
| `POST /api/abort` | Ctrl-C equivalent mid-turn |
| `POST /api/new-session` | Tell pi to start a fresh conversation |
| `POST /api/level` | Cycle `thinking level` (off/low/medium/high) |
| `POST /api/resume {file}` | Attach the running agent to an existing transcript |
| `GET  /api/sessions` | `{follow:{…}, sessions:[{file,title,mtimeMs,projDir,project,…}…]}` — bounded scan of `~/.pi/agent/sessions` (no deep recursion) |
| `POST /api/sessions {delete:file}` | Unlink one transcript. Refuses the session the live agent is currently in; also stops follow if it was tracking it. |
| `POST /api/sessions {follow:file, ongoing?}` / `{follow:false}` | Start follow on a file (optionally mark turn already in-flight) or stop it |
| `GET  /api/session-view?file=<proj>/<name>.jsonl` | Read-only decode of *any* transcript → `{file,project,title,messages:[…]}` (the “inspect what the PC did” pane; no `limit`) |
| `GET  /api/agent-files?dir=<rel>&key=instructions\|backlog` | `{key,file,exists,content,cwd}` for the per-project markdown file |
| `POST /api/agent-files {content} \| {fromTemplate:true}` | Write the file (body `content`), or seed it from the template (`fromTemplate`). Requires a real project dir (`dir`) present on disk. |
| `GET  /api/agent-templates` | `{templates:{instructions,backlog}}` seeds |
| `POST /api/agent-templates {instructions,backlog}` | Update both seeds |
| `GET  /api/notify?timeout=ms` | Long-poll the notification ring (up to 50, newest last). Used by the phone's "you have new notifications" refresh |
| `GET  /api/test-notify` | Fire a synthetic `{"ok":…,"n":[{title,text,at}]}` end-to-end: appends to the ring, curls ntfy, and web-pushes every subscription |
| `GET  /api/push/vapid-key` *(dup above, shown for reference)* | |
| `POST /api/push/subscribe` | Body = a full browser `PushSubscription` (`{endpoint, keys:{p256dh,auth}, …}`). Persisted keyed by endpoint. |
| `POST /api/push/unsubscribe` | Body `{endpoint}` — remove one sub |

## Architecture (post-refactor)

The original was a single 923-line `server.js`. It's now decomposed but
keeps the exact runtime behaviour. `server.js` at the repo root is a
three-line shim so the systemd unit keeps working unchanged:

```
server.js              # shim:  const {main}=require('./src/index.js'); main();
```

```
src/
  index.js              # wires the graph; owns the two http listeners; owns SIGTERM/SIGINT
  config.js             # parses flags/env into one CFG; tailnetIp(); pickHost()
  auth.js               # token load-or-create; isAuthed(req,url); PUBLIC_API set
  sessions.js           # read-only JSONL accessors (bounded scans, no recursion)
  agent.js              # createAgent({…}) — the pi --mode rpc child + JSON-RPC bridge
  follow.js             # createFollow({…}) — the 1.5 s file-tail turn watcher
  push.js               # VAPID keypair + pushSubs fan-out (uses webpush.js / lib-ece.js)
  webpush.js, lib-ece.js  # self-contained Web Push + ECE AES-128-GCM (no deps)
  notify.js             # in-memory 50-item ring + ntfy/webpush dual delivery
  static.js             # UI_DIR (= repo/components), PAGE_VER, route table, /app.bundle.js.sha256
  agentFiles.js         # per-project agent_instructions.md / agent_backlog.md + templates
  handlers.js           # the whole /api/* router, accessLog(), sendJson()

components/
  index.html            # the phone UI shell
  app.js                # chat + follow + push + agent-files editor
  sw.js                 # the Web Push service worker

ntfy.sh                 # start/stop/status/publish a self-hosted ntfy (see ntfy.sh)
start.sh                # systemctl --user wrapper for pibridge + pibridge-ntfy
tty-*.sh, ttyd-*.sh     # unrelated ttyd helpers, co-located in the same repo
```

**Wiring (no cycles).** `index.js` is the only file that knows about both
the agent and the follow controller. It constructs:

```
followCtl = createFollow({ onNotif: N.addNotif, filenameForSessionId })
agent     = createAgent({ follow: followCtl.follow,
                          sessionsTitle, filenameForSessionId,
                          autoFollow: () => followCtl.autoFollow(agent.state.sessionId) })
```

…and passes them to `handleApi(req, res, baseUrl, ctx)` as one bundle:
`ctx = {agent, follow:followCtl, notify:N, auth, push:P, staticBasePath,
staticRoutes, sequencer:()=>agent.seq}`. Neither `agent.js` nor `follow.js`
imports the other — `index.js` is the composition root.

### Lifecycle rules (deliberately preserved from the original)
- **No idle-kill.** The child is *never* killed because it sat idle. It's
  only killed on process exit or by an explicit SIGTERM/SIGINT to the
  bridge. If the child crashes, `agent.js` respawns it after 3 s.
- **No HTTP→HTTPS redirect.** When TLS is configured, HTTPS simply listens
  on `:8443` *in addition to* HTTP. There is no 302 from one to the other.
- **`/p/C98` (not `/`)** is the real UI route. `/` 302-redirects to it with
  query string preserved. Bumping `PAGE_VER` (in `src/static.js`) is how you
  force cached phones to re-fetch `app.bundle.js`.

## Operations
```bash
systemctl --user status pibridge          # the daemon itself
journalctl --user -u pibridge -f          # live logs
tail -f access.log                        # per-request line
./ntfy.sh publish "hello from PC"         # end-to-end ntfy
curl -s -X POST localhost:8787/api/test-notify \
     -H "Authorization: Bearer $(cat ~/.config/pibridge/token)"
```

## Tests
There's no formal test suite yet, but the whole surface is reachable by
hand:

```bash
# In a scratch port (don't collide with the running 8787 service)
PIBRIDGE_TEST=1 node server.js --port 18787 &
TOK=$(tr -d " \n\t" < ~/.config/pibridge/token)
H="Authorization: Bearer $TOK"; B="http://127.0.0.1:18787"

curl -s $B/api/health                                   # public
curl -s $B/api/state -H "$H"                            # full snapshot
curl -sN  $B/api/poll             -H "$H" | head        # NDJSON stream
curl -sN  "$B/api/notify?timeout=5000" -H "$H"          # 5 s wait
curl -sX POST $B/api/test-notify -H "$H"                # end-to-end push
curl -s     $B/api/sessions  -H "$H" | jq 'keys, (.sessions|length)'
curl -s  "$B/api/session-view?file=main/yourfile.jsonl" -H "$H"
curl -s  "$B/p/C98" -H "$H" | head -5                   # public anyway
```
