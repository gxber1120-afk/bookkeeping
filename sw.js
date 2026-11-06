const CACHE = 'mdj-ledger-v3';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

// Cloudflare Pages 會把 /index.html 轉址到 /，轉址過的回應不能拿來當頁面用，
// 所以存進快取前一律重建成乾淨（非轉址）的回應。
async function clean(res) {
  if (!res.redirected) return res;
  const body = await res.clone().blob();
  return new Response(body, { status: 200, statusText: 'OK', headers: res.headers });
}

async function put(req, res) {
  try { const c = await caches.open(CACHE); await c.put(req, await clean(res.clone())); } catch (e) {}
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(async u => {
      try { const r = await fetch(u, { cache: 'no-cache' }); if (r.ok) await c.put(u, await clean(r)); } catch (err) {}
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const fallbackPage = async () =>
  (await caches.match('./')) || (await caches.match('index.html')) || (await caches.match('./index.html'));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isNav = req.mode === 'navigate';

  e.respondWith((async () => {
    // 網路優先（有網路拿最新版），但最多等 3 秒；離線或太慢就用快取，確保一定打得開
    const net = fetch(req, { cache: 'no-cache' }).then(async res => {
      if (res && res.ok) {
        // 頁面一律以 './' 為快取鍵
        await put(isNav ? './' : req, res);
      }
      return res;
    });
    try {
      const res = await Promise.race([
        net,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), isNav ? 3000 : 5000))
      ]);
      if (isNav && res.redirected) return await clean(res);
      return res;
    } catch (err) {
      net.catch(() => {});
      const hit = isNav ? await fallbackPage() : (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true }));
      if (hit) return hit;
      if (isNav) return new Response('離線中，且尚無快取。請連線後重新開啟一次。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      return Response.error();
    }
  })());
});
