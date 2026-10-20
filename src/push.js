'use strict';
/**
 * push.js — Web Push (FCM/VAPID) subscription store + send fan-out.
 *
 * VAPID keys
 *   Auto-generated on first run, then reused. `VAPID.publicKey` is what the
 *   browser needs to build a push subscription. The actual crypto (VAPID JWT +
 *   ECE aes128gcm) is a zero-npm-dep implementation in webpush.js / lib-ece.js.
 *
 * Subscriptions
 *   Live in ~/.config/pibridge/push-subscriptions.json (keyed by endpoint),
 *   loaded at module load and persisted on every change. A device's push
 *   endpoint can "go away" (rotation, un-install, network change): a 404/410
 *   from the push service marks it GONE and we drop it; a 429/429/5xx is
 *   treated as transient and the sub is kept for the next attempt.
 */
const fs = require('node:fs');
const { CFG } = require('./config.js');
const WEBPUSH = require('./webpush.js');

// ------------------------------------------------------------ VAPID keys
const VAPID = WEBPUSH.loadKeys(CFG.vapidFile);
if (!fs.existsSync(CFG.vapidFile)) {
  WEBPUSH.saveKeys(CFG.vapidFile, VAPID);
  console.error(`[pibridge] wrote new VAPID keys to ${CFG.vapidFile}`);
}

// ------------------------------------------------------------ subscriptions
const pushSubs = new Map();
try {
  const arr = JSON.parse(fs.readFileSync(CFG.subsFile, 'utf8'));
  for (const s of arr) pushSubs.set(s.endpoint, s);
  console.error(`[pibridge] ${pushSubs.size} web-push subscription(s) loaded`);
} catch {}
function savePushSubs() {
  try {
    fs.writeFileSync(CFG.subsFile, JSON.stringify([...pushSubs.values()], null, 1), { mode: 0o600 });
  } catch {}
}

/**
 * Fan a notification out to every subscribed device. GONE subs (404/410) are
 * dropped + persisted; transient (429/5xx) subs are kept and retried on the
 * next push. `WEBPUSH.fanout` does all the HTTPS + ECE work in a Promise, and
 * we swallow rejections so push failures never take the rest of the pipe down.
 */
function webPushNotify(title, text) {
  if (!pushSubs.size) return;
  const payload = JSON.stringify({ title, text: text || '' });
  WEBPUSH.fanout([...pushSubs.values()], payload, VAPID).then(
    ({ ok, gone, transient }) => {
      if (transient && transient.length)
        console.error(`[pibridge] web-push: ${transient.length} transient failure(s) — subs kept, will retry next push`);
      let changed = false;
      for (const ep of gone) {
        pushSubs.delete(ep);
        changed = true;
      }
      if (changed) {
        savePushSubs();
        if (!pushSubs.size)
          console.error('[pibridge] WARNING: all web-push subscriptions were GONE — check FCM/VAPID config and push permissions on the device');
      }
    },
    (e) => console.error('[pibridge] web-push fanout error:', e && e.message)
  );
}

module.exports = { VAPID, pushSubs, savePushSubs, webPushNotify };
