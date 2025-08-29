// sw.js — v1-r2 (network-first pour HTML)
const SW_VERSION   = 'v1-r2';
const CACHE_STATIC = 'qhse-static-v4-logos';
const ASSETS = [
  './',
  './index.html',
  './sw.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './qhse-logo.svg',
  './firstaid-icon.svg'
];


self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_STATIC).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => ![CACHE_STATIC, CACHE_DYNAMIC].includes(k))
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  const req = evt.request;

  // HTML -> network-first
  if (req.mode === 'navigate' || req.destination === 'document') {
    evt.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_DYNAMIC).then(c => c.put('/', copy).catch(()=>{}));
          return res;
        })
        .catch(() => caches.match('/') || caches.match('./') || caches.match('index.html'))
    );
    return;
  }

  // Assets même origine -> cache falling back to network
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    evt.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_DYNAMIC).then(c => c.put(req, copy).catch(()=>{}));
          return res;
        })
      )
    );
    return;
  }

  // Externe -> network, fallback cache
  evt.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_DYNAMIC).then(c => c.put(req, copy).catch(()=>{}));
      return res;
    }).catch(() => caches.match(req))
  );
});
