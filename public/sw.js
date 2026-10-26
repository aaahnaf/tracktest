// No-op service worker: the previous cache-first strategy could serve stale or
// mismatched hashed assets after a redeploy, which caused a blank white screen.
// This worker immediately unregisters itself and clears any old caches.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.navigate(c.url).catch(() => {})))
  );
});

self.addEventListener('fetch', () => {});
