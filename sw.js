// Nama cache baru untuk memaksa HP menghapus versi lama
const CACHE_NAME = 'rema-manga-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/js/app.js',
  '/assets/js/api.js', // Pastikan namanya api.js, bukan mangadex.js lagi
  '/manifest.json'
];

self.addEventListener('install', event => {
  // Paksa Service Worker baru langsung aktif tanpa menunggu
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Hancurkan cache versi lama (rema-manga-v1)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Strategi NETWORK FIRST: Selalu ambil dari internet dulu. 
  // Kalau tidak ada sinyal (offline), baru pakai cache.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan versi terbaru ke cache secara diam-diam
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
