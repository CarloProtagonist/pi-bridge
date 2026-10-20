'use strict';
/**
 * server.js — compatibility shim.
 *
 * The systemd user service (`pibridge.service`) was written against this file
 * before the code was split into `src/`, so we keep `server.js` at the repo
 * root as a thin entry point that just loads the real one. Nothing else to
 * maintain here — all logic lives in `src/` (see `src/index.js`).
 *
 *   ~/.config/systemd/user/pibridge.service  →
 *     ExecStart=/usr/bin/node /home/crispy/pi-bridge/server.js --port 8787
 */
const { main } = require('./src/index.js');

main();
