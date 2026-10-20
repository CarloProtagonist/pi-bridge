'use strict';
/**
 * agentFiles.js — per-project agent files (agent_instructions.md /
 * agent_backlog.md) and the editable templates they are seeded from.
 *
 * Each pi project can live at its root two markdown files that agents read:
 *   agent_instructions.md  — standing rules for agents working in that project
 *   agent_backlog.md       — the ticket backlog
 *
 * The phone UI can show whether they exist, create them from a (user-editable)
 * template and edit them in place. A project's real folder (its cwd) is taken
 * from the first line of any session .jsonl under ~/.pi/agent/sessions/<dir>/
 * — that is authoritative and avoids ambiguity from the dash-encoded dir names.
 */
const fs = require('node:fs');
const path = require('node:path');
const { CFG } = require('./config');

const AGENT_SESSIONS_DIR = path.join(CFG.home, '.pi/agent/sessions');
const AGENT_TEMPLATES_STORE = CFG.templatesFile;
const AGENT_FILE_KEYS = {
  instructions: 'agent_instructions.md',
  backlog: 'agent_backlog.md',
};

const AGENT_DEFAULT_TEMPLATES = {
  instructions: [
    '# Agent Instructions',
    '',
    'Standing rules for any agent working in this project. Read these fully before acting.',
    '',
    '1. Read before you write — look at the relevant files and code before changing anything.',
    '2. Small, testable steps — break the work into subtasks and do them one at a time.',
    '3. Test before you close — run whatever verifies the change (build, tests, or a manual check) before marking a ticket done.',
    '4. Keep the backlog current — track work in `agent_backlog.md` and move tickets as they progress.',
    '5. If blocked, say so — describe what is stuck and the options, and stop instead of guessing at anything irreversible.',
    '',
  ].join('\n'),
  backlog: [
    '# Agent Backlog',
    '',
    'One line per ticket. Move an item between the sections as its state changes.',
    'Use: `[ ]` not started · `[~]` in progress · `[x]` done. Prefix priority when it matters (P0/P1).',
    '',
    '## Backlog',
    '_Future and not-yet-scheduled work._',
    '- [ ] ',
    '',
    '## Current Sprint',
    '_The small set of things committed for this sprint._',
    '- [ ] ',
    '',
    '## Done',
    '_Finished and verified (add a date when you complete one)._ ',
    '- [x] ',
    '',
  ].join('\n'),
};

function agentLoadTemplates() {
  const t = {
    instructions: AGENT_DEFAULT_TEMPLATES.instructions,
    backlog: AGENT_DEFAULT_TEMPLATES.backlog,
  };
  try {
    const o = JSON.parse(fs.readFileSync(AGENT_TEMPLATES_STORE, 'utf8'));
    if (typeof o.instructions === 'string' && o.instructions.trim() !== '')
      t.instructions = o.instructions;
    if (typeof o.backlog === 'string' && o.backlog.trim() !== '') t.backlog = o.backlog;
  } catch (_) {
    /* first run or absent — use defaults */
  }
  return t;
}
const AGENT_TEMPLATES = agentLoadTemplates();
function agentSaveTemplates() {
  try {
    fs.mkdirSync(path.dirname(AGENT_TEMPLATES_STORE), { recursive: true });
    fs.writeFileSync(AGENT_TEMPLATES_STORE, JSON.stringify(AGENT_TEMPLATES, null, 2) + '\n', 'utf8');
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Map a session directory name to the real project folder (the pi cwd).
 * Returns null when we cannot prove it is a directory — the UI then treats the
 * project as unavailable instead of guessing.
 */
function agentResolveProject(dirName) {
  if (typeof dirName !== 'string' || !/^[-+.A-Za-z0-9]+$/.test(dirName)) return null;
  const dd = path.join(AGENT_SESSIONS_DIR, dirName);
  let cwd = null;
  let files = [];
  try {
    files = fs.readdirSync(dd).filter((f) => f.endsWith('.jsonl')).sort();
  } catch (_) {
    return null;
  }
  for (const f of files) {
    try {
      const fd = fs.openSync(path.join(dd, f), 'r');
      const buf = Buffer.alloc(2048);
      const n = fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      const first = buf.toString('utf8').slice(0, 8000).split('\n')[0];
      try {
        const o = JSON.parse(first);
        if (o.cwd) { cwd = o.cwd; break; }
      } catch (_) {}
    } catch (_) {}
  }
  if (!cwd) return null; // only ever resolve what we can prove is a directory
  try {
    if (!fs.statSync(cwd).isDirectory()) return null;
  } catch (_) {
    return null;
  }
  return cwd;
}
/**
 * Resolve the project cwd for a request, or reply 404 and return null.
 * `sendJson` is passed in by the handler to keep this module transport-agnostic.
 */
function agentProjectCwdOrReply(res, dirName, sendJsonImpl) {
  const cwd = agentResolveProject(dirName);
  if (!cwd) { sendJsonImpl(res, 404, { error: 'project directory not found on PC' }); return null; }
  return cwd;
}
function agentFileExists(cwd, key) {
  try {
    return fs.statSync(path.join(cwd, AGENT_FILE_KEYS[key])).isFile();
  } catch (_) {
    return false;
  }
}

module.exports = {
  AGENT_FILE_KEYS,
  AGENT_TEMPLATES,
  agentResolveProject,
  agentProjectCwdOrReply,
  agentFileExists,
  agentSaveTemplates,
};
