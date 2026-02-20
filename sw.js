// sw.js — QHSE PWA (robuste) — v11
const VERSION = 'v11';

const CACHE_STATIC  = `qhse-static-${VERSION}`;
const CACHE_DYNAMIC = `qhse-dyn-${VERSION}`;

// Assets “vraiment” statiques (icônes / svg / manifest)
// (on évite de figer des HTML/JS ici pour ne pas bloquer les mises à jour)
const STATIC_ASSETS = [
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-1024.png',
  './qhse-logo.svg',
  './firstaid-icon.svg',
  './flag-fr.svg',
  './flag-gb.svg',
  './flag-nl.svg'
];

// -------- helpers
async function putInCache(cacheName, req, res) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(req, res);
  } catch (e) {
    // ignore quota / opaque caching issues
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  await putInCache(CACHE_STATIC, req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    await putInCache(CACHE_DYNAMIC, req, res.clone());
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw e;
  }
}

// Stale-while-revalidate (rapide + refresh en arrière-plan)
async function staleWhileRevalidate(req) {
  const cached = await caches.match(req);
  const fetchPromise = fetch(req)
    .then(async (res) => {
      await putInCache(CACHE_DYNAMIC, req, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || cached;
}

// -------- install / activate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![CACHE_STATIC, CACHE_DYNAMIC].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// -------- fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) Navigations (HTML) : toujours network-first (évite pages obsolètes)
  // - couvre les clics, refresh, deep links
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Same-origin : stratégie par type
  if (sameOrigin) {
    // a) assets statiques (icônes, svg, manifest) : cache-first
    if (STATIC_ASSETS.some(p => url.pathname.endsWith(p.replace('./','/')))) {
      event.respondWith(cacheFirst(req));
      return;
    }

    // b) JS/CSS/JSON : stale-while-revalidate (rapide + auto update)
    if (/\.(js|css|json|webmanifest)$/i.test(url.pathname)) {
      event.respondWith(staleWhileRevalidate(req));
      return;
    }

    // c) HTML explicite : network-first
    if (/\.(html)$/i.test(url.pathname)) {
      event.respondWith(networkFirst(req));
      return;
    }

    // d) le reste : network-first (safe)
    event.respondWith(networkFirst(req));
    return;
  }

  // 3) Cross-origin (Google Sheets CSV, CDN libs, etc.) : network-first
  event.respondWith(networkFirst(req));
});
