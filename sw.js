// Monitor Dashboard — Service Worker
const CACHE = 'monitor-v1';
const PRECACHE = [
  '/Dashboard/',
  '/Dashboard/index.html',
  '/Dashboard/admin.html',
  '/Dashboard/logo.png',
  '/Dashboard/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy — always try fresh, fall back to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and cross-origin requests (Firebase, Nextcloud proxy etc.)
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!url.origin.includes('rncall.github.io')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
