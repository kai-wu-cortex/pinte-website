// Service Worker for caching static assets (images, videos)
// Reduces traffic from remote object storage by caching locally

const CACHE_NAME = 'pinte-assets-cache-v1';
const ASSETS_TO_CACHE = [
  // Cache image file extensions
  /\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/i,
  // Cache video file extensions
  /\.(mp4|webm|ogg|mov)$/i,
  // Cache other static assets
  /\.(css|js|woff|woff2|ttf)$/i,
];

// Maximum cache size for images/videos (approx 50MB)
const MAX_CACHE_SIZE = 50 * 1024 * 1024;

// Install: cache nothing upfront, cache on first request
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      self.clients.claim();
      return trimCache();
    })
  );
});

// Trim cache to keep size under limit
async function trimCache() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  let totalSize = 0;
  const toDelete = [];

  // Sort by oldest first (delete least recently used when over size)
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      totalSize += estimateSize(response);
      if (totalSize > MAX_CACHE_SIZE) {
        toDelete.push(request);
      }
    }
  }

  // Delete oldest entries until we're under the limit
  return Promise.all(toDelete.map(request => cache.delete(request)));
}

function estimateSize(response) {
  // rough estimate based on content-length
  const contentLength = response.headers.get('Content-Length');
  return contentLength ? parseInt(contentLength, 10) : 1024 * 1024; // default 1MB estimate
}

// Intercept fetch: cache GET requests for assets that match our patterns
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check if the URL matches any of our cache patterns
  const shouldCache = ASSETS_TO_CACHE.some((pattern) => pattern.test(request.url));

  if (!shouldCache) {
    // No cache - pass through
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // Update cache in background
        updateCache(request);
        return cachedResponse;
      }

      // No cached response - fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Cache the response for next time
          if (networkResponse.ok && (networkResponse.type === 'cors' || networkResponse.type === 'basic')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(); // trim after adding
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          // Offline fallback - if we have anything cached, return it
          console.warn('[Service Worker] Fetch failed', error);
          return cachedResponse;
        });
    })
  );
});

// Update cache in background
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && (networkResponse.type === 'cors' || networkResponse.type === 'basic')) {
      const cache = await caches.open(CACHE_NAME);
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      await trimCache();
    }
  } catch (error) {
    // Ignore update errors
    console.debug('[Service Worker] Background cache update failed', error);
  }
}
