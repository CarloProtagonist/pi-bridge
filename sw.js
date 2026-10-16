/* pi-bridge service worker: web-push notifications + tap-to-focus. */
self.addEventListener("push", (event) => {
  let d = {};
  try { d = JSON.parse(event.data && event.data.text() || "{}"); } catch { d = {}; }
  if (!("Notification" in self)) return;
  const title = d.title || "pi";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.text || "",
      tag: "pibridge",
      renotify: true
    })
  );
});

// FCM drops/rotates device push endpoints over time (an unpushed-to endpoint
// eventually 410s Gone). Chrome signals this to the SW via
// `pushsubscriptionchange`. Without a handler, the dead endpoint stays
// registered server-side and every push to the phone silently fails until the
// user re-taps 🔔 — exactly what wiped the subscription file on Oct 16.
addEventListener("pushsubscriptionchange", async (event) => {
  try {
    event.waitUntil((async () => {
      const reg = self.registration;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return; // unregistered (user removed) — nothing to sync
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON())
      }).catch(() => {});
    })());
  } catch (e) {
    /* non-fatal: a missed rotation just means one push is dropped. */
  }
});

// Tap a notification to focus the page.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = self.location.origin + "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then(async (list) => {
      for (const c of list) { if (c.url === url && "focus" in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
