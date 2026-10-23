const VERSION = 'v2.0.4';
const CACHE_NAME = 'pennyworth-' + VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json'
];

self.addEventListener('install', event => {
  console.log('[SW] Install', VERSION);
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate', VERSION);
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Delete old cache', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // version.json 永遠抓最新，不快取
  if (req.url.includes('version.json')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then(r => {
        return r;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // HTML 頁面：網路優先，保證改官網馬上看到
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  // 其他資源：快取優先
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
