const CACHE_NAME = 'athar-v45-4-qibla-push';
const CORE_ROUTES = ['/', '/quran', '/duas', '/library', '/tasbeeh', '/prayer-times', '/daily', '/qibla', '/about'];

async function cachePageAndAssets(cache, route) {
  try {
    const response = await fetch(route, { cache: 'reload' });
    if (!response || !response.ok) return;
    await cache.put(route, response.clone());
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return;
    const html = await response.text();
    const matches = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);
    const urls = [...new Set(matches)]
      .filter(url => url.startsWith('/') && !url.startsWith('//'))
      .filter(url => !url.startsWith('/api/'));
    await Promise.all(urls.map(async url => {
      try {
        const asset = await fetch(url, { cache: 'reload' });
        if (asset && asset.ok) await cache.put(url, asset);
      } catch (_) {}
    }));
  } catch (_) {}
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let contentRoutes = [];
    try {
      const response = await fetch('/offline-routes.json', { cache: 'reload' });
      if (response.ok) contentRoutes = await response.json();
    } catch (_) {}
    for (const route of [...CORE_ROUTES, ...contentRoutes]) await cachePageAndAssets(cache, route);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const network = await fetch(event.request, { cache: 'no-store' });
        if (network && network.ok) {
          await cache.put(url.pathname + url.search, network.clone());
          await cache.put(url.pathname, network.clone());
        }
        return network;
      } catch (_) {
        return (await cache.match(url.pathname + url.search)) ||
               (await cache.match(url.pathname)) ||
               (await cache.match('/')) ||
               new Response('أثر غير متاح مؤقتًا', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const network = await fetch(event.request);
      if (network && network.ok) await cache.put(event.request, network.clone());
      return network;
    } catch (_) {
      return new Response('', { status: 504 });
    }
  })());
});


self.addEventListener('push', event => {
  let data = { title: 'أثر — حان وقت الصلاة', body: 'الله أكبر، الله أكبر', url: '/prayer-times' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/athar-icon-192.png',
    badge: '/athar-icon-192.png',
    tag: data.tag || 'athar-prayer',
    renotify: true,
    data: { url: data.url || '/prayer-times' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || '/prayer-times';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
