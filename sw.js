const CACHE_NAME = 'nexus-proforma-v12';
const APP_SHELL = ['./', './index.html', './manifest.json', './sw.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Stratégie "network-first" : essayer le réseau d'abord, fallback au cache
  event.respondWith(
    fetch(event.request).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return resp;
    }).catch(() => {
      return caches.match(event.request, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
