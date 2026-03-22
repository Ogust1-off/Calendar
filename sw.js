// Calendar by Shortcut™ — Service Worker v2
const CACHE = 'cal-v2';
const ASSETS = ['./', './index.html', './manifest.json',
  './Asset/CSS/styleagenda_b.css', './Asset/JS/onboarding.js', './Asset/JS/agenda_b.js'];

self.addEventListener('install',  e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('corsproxy.io')) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r&&r.status===200&&r.type==='basic') { const cl=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); }
    return r;
  }).catch(() => caches.match(e.request)));
});
