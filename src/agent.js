'use strict';
/**
 * agent.js — owns the `pi --mode rpc` child process and the JSON-RPC bridge.
 *
 * On start we spawn `pi --mode rpc <extraArgs>` and never *intentionally* kill
 * it based on inactivity: a crash auto-respawns after 3s (the RPC bridge is
 * self-healing), and the *only* clean stop is `stop()`, which the bridge calls
 * on SIGTERM / SIGINT so the child doesn't outlive the bridge.
 *
 * Line protocol (one JSON per line, both directions):
 *   in : {id, type, ...fields}       — request  (prompt / abort / new_session /
 *                                       switch_session / get_state / get_messages /
 *                                       set_session_name / cycle_thinking_level)
 *   out: {id, type:"response", success, data|error}  — answer to an in-flight id
 *   out: {type:"agent_start" | "agent_settled" | "compaction_start" |
 *         "compaction_end" | "thinking_level_changed" | "session_info_changed" |
 *         "extension_error" | <event>}               — pushed to every connected
 *                                                       UI client via /api/poll
 *
 * Every out line is *also* broadcast to the /api/poll long-poll clients, which
 * is how the phone UI renders streaming in real time.
 */
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const path = require('node:path');
const { CFG, tailnetIp } = require('./config.js');
const fs = require('node:fs');

/**
 * Create the agent runtime. `deps` lets us wire in the follow + notify
 * modules without import cycles:
 *   deps.follow  — the follow controller (reads follow.file for publicState)
 *   deps.sessionsTitle(file) — returns a short title for a session file
 *   deps.filenameForSessionId(id) — id → "<proj>/<file>.jsonl" | null
 *   deps.autoFollow() — called on every RPC event; lets index.js re-point
 *                       follow at the new active transcript
 *   deps.onSettled(title, text) — called once, when the model goes idle (was
 *                       streaming, now not). This is the reliable
 *                       "turn complete → ready for your input" signal and is
 *                       used for the phone push (per the 2026-10-21 spec).
 */
function createAgent({ follow, sessionsTitle, filenameForSessionId, autoFollow, onSettled }) {
  let proc = null;
  let lineBuf = '';
  let seq = 0;
  const events = []; // { s, line } — ring buffer for cursor replays

  const state = {
    model: null,
    thinkingLevel: null,
    sessionName: null,
    sessionId: null,
    messageCount: 0,
  };
  let streaming = false;
  let compaction = false;
  const rpcWaiters = new Map();
  const pollers = new Set();

  // Single chokepoint for the "working" flag. Fires onSettled() exactly once,
  // on a streaming→idle transition (the only reliable "needs your input" signal;
  // file-based depth is unreliable — see sessions.js scanDepth notes).
  function setStreaming(v) {
    v = !!v;
    if (streaming && !v) {
      try { onSettled && onSettled('turn complete — ready for your input'); } catch {}
    }
    streaming = v;
  }

  // ------------------------------------------------------------- public state
  const publicState = () => ({
    agentUp: !!(proc && proc.exitCode === null),
    isStreaming: streaming,
    isCompacting: compaction,
    model: state.model,
    thinkingLevel: state.thinkingLevel,
    sessionName: state.sessionName,
    sessionId: state.sessionId,
    followOn: follow.on,
    followFile: follow.on ? follow.file : null,
    streaming,           // live "working" flag straight from the pi RPC (authoritative)
    followBusy: !!follow.busy,
    followProject: follow.proj || null,
    followName: (function () {
      try {
        return (follow.on ? sessionsTitle(path.join(CFG.sessionsDir, follow.file)) : null) || null;
      } catch {
        return null;
      }
    })(),
    messageCount: state.messageCount,
    cwd: CFG.cwd,
    tailnet: tailnetIp(),
  });

  /** Push one record to every connected /api/poll client + the event ring. */
  function broadcast(rec) {
    const s = ++seq;
    const line = JSON.stringify({ s, e: rec }) + '\n';
    events.push({ s, line });
    if (events.length > CFG.maxEvents) events.splice(0, events.length - CFG.maxEvents);
    for (const p of pollers) p.deliver(line);
  }

  /** Send one RPC to the pi child, resolve with the {success, data} record. */
  function sendRpc(type, fields = {}, timeoutMs = 20000) {
    if (!proc || proc.exitCode !== null || !proc.stdin.writable)
      return Promise.reject(new Error('agent process not running'));
    const id = 'c' + crypto.randomBytes(6).toString('hex');
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        rpcWaiters.delete(id);
        reject(new Error(`timeout waiting for ${type}`));
      }, timeoutMs);
      rpcWaiters.set(id, { resolve, reject, timeout: t });
      proc.stdin.write(JSON.stringify({ id, type, ...fields }) + '\n');
    });
  }

  function applyStateData(d) {
    if (!d) return;
    setStreaming(!!d.isStreaming);
    compaction = !!d.isCompacting;
    state.sessionId = d.sessionId || state.sessionId;
    state.model = d.model ? `${d.model.provider}/${d.model.id}` : state.model;
    state.thinkingLevel = d.thinkingLevel ?? state.thinkingLevel;
    state.sessionName = (d.sessionName && d.messageCount > 0) ? d.sessionName : null;
    state.messageCount = d.messageCount || 0;
    broadcast({ type: 'status', state: publicState() });
    autoFollow(d.sessionId || state.sessionId);
  }
  const applyGetState = () => sendRpc('get_state').then((r) => applyStateData(r.data)).catch(() => {});

  // ------------------------------------------------------------- event loop
  /** A line from pi: route RPC responses to their waiter; the rest broadcast. */
  function handleLine(raw) {
    const rec = JSON.parse(raw);
    if (rec.type === 'response') {
      const w = rpcWaiters.get(rec.id);
      if (w) {
        rpcWaiters.delete(rec.id);
        clearTimeout(w.timeout);
        if (rec.success) w.resolve(rec);
        else w.reject(new Error(String(rec.error || 'command failed')));
      }
      return;
    }
    if (rec.type === 'agent_start') {
      setStreaming(true);
    } else if (rec.type === 'agent_settled') {
      setStreaming(false);
      applyGetState();
    } else if (rec.type === 'compaction_start') compaction = true;
    else if (rec.type === 'compaction_end') {
      compaction = false;
      applyGetState();
    } else if (rec.type === 'thinking_level_changed') {
      state.thinkingLevel = rec.level || state.thinkingLevel;
      broadcast({ type: 'thinking_level_changed', level: state.thinkingLevel });
    } else if (rec.type === 'session_info_changed') {
      state.sessionName = rec.name || null;
    } else if (rec.type === 'extension_error') {
      broadcast({ type: 'extension_error', note: `${rec.extensionPath || 'extension'}: ` + String(rec.error).slice(0, 300) });
    } else broadcast(rec);
  }

  function startProcess() {
    const args = ['--mode', 'rpc', ...CFG.extraArgs];
    proc = spawn(CFG.piBin, args, {
      cwd: CFG.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PIPED: '1' },
    });
    console.error(`[pibridge] started child: ${CFG.piBin} ${args.join(' ')} (pid ${proc.pid}, cwd ${CFG.cwd})`);
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (d) => {
      lineBuf += d;
      let i;
      while ((i = lineBuf.indexOf('\n')) >= 0) {
        const line = lineBuf.slice(0, i);
        lineBuf = lineBuf.slice(i + 1);
        if (line.trim()) {
          try {
            handleLine(line.replace(/\r$/, ''));
          } catch (e) {
            console.error('[pibridge] bad JSON line from pi: ' + e.message);
          }
        }
      }
    });
    proc.stderr.on('data', (d) => {
      const s = String(d).trim();
      if (s) console.error('[pi] ' + s);
    });
    proc.on('exit', (code) => {
      broadcast({ type: 'agent_exit', code, ts: new Date().toISOString() });
    });
    proc.on('close', (code) => {
      console.error(`[pibridge] pi child exited (code ${code}); retry in 3s`);
      // Drop any in-flight RPC waiters so callers get a fast error.
      for (const w of rpcWaiters.values()) {
        clearTimeout(w.timeout);
        w.reject(new Error('agent exited'));
      }
      rpcWaiters.clear();
      // Close every open /api/poll connection so clients see the dead conn
      // and resync instead of hanging.
      for (const p of pollers) {
        try { p.close(); } catch {}
      }
      pollers.clear();
      setTimeout(() => {
        if (!proc || proc.exitCode !== null) startProcess();
      }, 3000);
    });
    setTimeout(applyGetState, 700);
  }

  // ------------------------------------------------------------- public API
  return {
    publicState,
    broadcast,
    sendRpc,
    applyStateData,
    applyGetState,
    start: startProcess,
    pollers,
    events,
    state,
    get isStreaming() {
      return streaming;
    },
    get isCompacting() {
      return compaction;
    },
    /** The current child (for liveness checks) — may be a dying/zombie handle briefly. */
    get proc() {
      return proc;
    },
    /** Latest event sequence number, for /api/state cursors. */
    get seq() {
      return seq;
    },
    stop: () => {
      try {
        proc && proc.stdin.end();
      } catch {}
      try {
        proc && proc.kill();
      } catch {}
    },
  };
}

module.exports = { createAgent };
