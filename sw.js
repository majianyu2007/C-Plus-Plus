const CACHE_NAME = 'oop-review-v1.5.6';
const ASSETS_TO_CACHE = [
  './',
  './index.html?v=1.5.6',
  './assets/style.css?v=1.5.6',
  './assets/app.js?v=1.5.6',
  './assets/icon.svg',
  './data/questions.json',
  './data/programming.json',
  './data/knowledge.json',
  './data/kp_vocab.json',
  './data/metadata.json'
];

// Install: Cache all static shell files and initial DB files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Serve cached assets offline or speed up online requests
self.addEventListener('fetch', (e) => {
  // Only handle HTTP/HTTPS (bypass browser extensions or local file:// protocol)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Dynamic stale-while-revalidate strategy for local question data folder
        if (e.request.url.includes('/data/')) {
          fetch(e.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, networkResponse);
              });
            }
          }).catch(() => {
            // Ignore fetch errors (offline state)
          });
        }
        return cachedResponse;
      }

      // Not in cache, fetch from network and dynamically cache the result
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clonedResponse);
          });
        }
        return networkResponse;
      });
    })
  );
});
