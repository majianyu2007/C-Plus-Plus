self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[Service Worker] Deleting cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      console.log('[Service Worker] Caches cleared. Unregistering...');
      return self.registration.unregister();
    }).then(() => {
      console.log('[Service Worker] Unregistered. Reloading clients...');
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      for (const client of clients) {
        client.navigate(client.url);
      }
    })
  );
});
