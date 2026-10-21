/* pi-bridge service worker.
 *
 * Policy (user decision, 2026-10-20): NO web/browser notifications at all.
 * The push handler is a deliberate no-op — web notifications were covering
 * the screen and are not wanted. The phone still gets its system banner via
 * the self-hosted ntfy server (port 3333), which the pi-bridge publishes to
 * directly (src/notify.js → ntfy()), independent of any browser.
 *
 * The rest of the web-push plumbing (subscription endpoints in app.js) is
 * left intact and inert: pushes keep arriving here and are thrown away.
 */

// Deliberately does NOT call registration.showNotification().
self.addEventListener("push", () => {});

// Keep the endpoint-rotation sync: if FCM rotates the device endpoint, POST
// the new one so the (inert) server-side subscription list stays consistent.
addEventListener("pushsubscriptionchange", async (event) => {
  try {
    event.waitUntil((async () => {
      const reg = self.registration;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON())
      }).catch(() => {});
    })());
  } catch (e) {
    /* non-fatal */
  }
});

// On upgrade from older builds: close any notifications the old service
// worker left on screen / in the tray.
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const list = await self.registration.getNotifications();
      for (const n of list) n.close();
    } catch {}
  })());
});

// Nothing to click (no notifications are shown), but keep a no-op handler so
// old in-flight notifications from previous builds don't error.
self.addEventListener("notificationclick", (e) => {
  e.notification && e.notification.close();
});
