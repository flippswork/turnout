/* Minimal SW for GitHub Pages static PWA */
const CACHE = 'turnout-cache-v1';
const CORE = ['./', './copilot_turnout_v2.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only cache GET requests
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: false });
    if (cached) return cached;

    try{
      const res = await fetch(req);
      // Cache same-origin basic responses
      const url = new URL(req.url);
      if (url.origin === self.location.origin && res.ok && (res.type === 'basic' || res.type === 'default')) {
        cache.put(req, res.clone());
      }
      return res;
    }catch{
      // offline fallback to app shell
      return (await cache.match('./')) || (await cache.match('./copilot_turnout_v2.html')) || new Response('Offline', { status: 200 });
    }
  })());
});

