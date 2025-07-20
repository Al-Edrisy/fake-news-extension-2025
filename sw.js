const CACHE_NAME = 'verinews-v1';
const urlsToCache = [
  '/',
  '/desktop',
  '/services',
  '/docs',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico',
  '/favicon.svg'
];

// Install event - cache resources
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background sync tasks
  console.log('Background sync triggered');
  return Promise.resolve();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
} 