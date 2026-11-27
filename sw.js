// Kill-switch Service Worker : supprime tous les caches, se désenregistre et recharge la page.
self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.registration.unregister();
    }).then(function() {
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clients) {
      clients.forEach(function(client) {
        if (client.navigate) client.navigate(client.url);
      });
    })
  );
});
