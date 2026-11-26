// Service worker de Delivery Futsal
// Estrategia: primero red (así siempre ves la última versión) y, si no hay
// conexión, usa la copia guardada. No toca los datos de la app (localStorage).
const CACHE = 'delivery-futsal-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE).then((cache) =>
            cache.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png']).catch(() => {})
        )
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    event.respondWith(
        fetch(req)
            .then((res) => {
                if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
});
