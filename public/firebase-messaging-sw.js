/**
 * Admin alert service worker (Firebase Cloud Messaging web push).
 *
 * Registered only on devices where the admin taps "Turn on alerts" (see
 * lib/adminPushClient.ts). It has no fetch handler, so it never touches the
 * public storefront's pages or caching.
 *
 * The server (lib/adminPush.ts) sends data-only messages:
 *   { title, body, url, tag }
 * While the admin console is on screen the alert is handed to the page (which
 * shows its own toast and refreshes); otherwise a system notification is shown.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

function readPayload(event) {
  try {
    const json = event.data ? event.data.json() : {};
    return json.data || json;
  } catch (err) {
    return { title: 'Innova Cabs admin', body: event.data ? event.data.text() : '' };
  }
}

const isAdminClient = (client) => new URL(client.url).pathname.startsWith('/admin');

self.addEventListener('push', (event) => {
  const data = readPayload(event);
  const title = data.title || 'Innova Cabs admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const visibleAdmin = clients.filter((c) => isAdminClient(c) && c.visibilityState === 'visible');
      if (visibleAdmin.length > 0) {
        visibleAdmin.forEach((c) => c.postMessage({ type: 'admin-alert', data }));
        return undefined;
      }
      return self.registration.showNotification(title, {
        body: data.body || '',
        tag: data.tag || undefined,
        renotify: Boolean(data.tag),
        icon: '/logo-car.png',
        badge: '/logo-car.png',
        data: { url: data.url || '/admin' },
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/admin', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const admin = clients.find(isAdminClient);
      if (admin) {
        // navigate() only works on pages this worker controls; otherwise the page navigates itself
        admin.postMessage({ type: 'admin-open', url: target });
        return admin.focus().catch(() => self.clients.openWindow(target));
      }
      return self.clients.openWindow(target);
    })
  );
});
