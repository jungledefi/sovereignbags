self.addEventListener('install', event => {
  // You can add resources to cache here if needed
});

self.addEventListener('activate', event => {
  // Service worker activated
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
