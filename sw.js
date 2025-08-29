// sw.js — QHSE PWA (cache statique + dynamique) — v4-logos-THICK2
const CACHE_STATIC  = 'qhse-static-v4-logos-THICK2';
const CACHE_DYNAMIC = 'qhse-dyn-v4-logos-THICK2';

// Ressources à mettre en cache lors de l'installation
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

// Installation : pré-cache des assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch : gestion des requêtes
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // ignore POST/PUT/...

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // Helper: cache first pour nos ASSETS connus
  const cacheFirst = () =>
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_DYNAMIC).then((c) => c.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req));
    });

  // Helper: network first (avec fallback cache)
  const networkFirst = () =>
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_DYNAMIC).then((c) => c.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req));

  // Politique : 
  // - mêmes origines → cache-first pour les ASSETS, sinon network-first
  // - autres origines → network-first (fallback cache)
  if (sameOrigin) {
    if (ASSETS.some((p) => url.pathname.endsWith(p.replace('./','/')) || url.pathname === p.replace('./','/'))) {
      event.respondWith(cacheFirst());
    } else {
      event.respondWith(networkFirst());
    }
  } else {
    event.respondWith(networkFirst());
  }
});
