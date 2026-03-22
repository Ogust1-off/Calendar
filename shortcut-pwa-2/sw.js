// Shortcut™ — Service Worker
// © 2026 Ogust'1

const CACHE_NAME = 'shortcut-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Asset/CSS/styleagenda_b.css',
  './Asset/JS/agenda_b.js',
];

// Installation : mise en cache des assets statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : supprime les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes vers l'API Google Calendar (toujours réseau)
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('corsproxy.io')) {
    return; // laisse passer directement
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Met à jour le cache avec la réponse fraîche
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Offline : sert depuis le cache
        return caches.match(event.request);
      })
  );
});
