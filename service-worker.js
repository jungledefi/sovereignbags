self.addEventListener('install', event => {
  console.log('Service worker installed');
  // You can add resources to cache here if needed
});

self.addEventListener('activate', event => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
