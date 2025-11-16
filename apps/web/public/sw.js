// public/sw.js
// Service Worker for caching critical resources

const CACHE_NAME = 'whatsnxt-v1';
const STATIC_CACHE_NAME = 'whatsnxt-static-v1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/favicon.ico',
  '/manifest.json'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {

  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES);
      }),
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached resources with stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // Skip top-level navigations to avoid serving stale HTML
  if (request.mode === 'navigate') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Static assets: Cache first, fallback to network
    event.respondWith(cacheFirst(request));
  } else if (isCriticalResource(request)) {
    // Critical resources: Stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else if (isAPIRequest(request)) {
    // API requests: Network first, fallback to cache
    event.respondWith(networkFirst(request));
  } else {
    // Everything else: Network first
    event.respondWith(networkFirst(request));
  }
});

// Helper function to check if request is for static assets
function isStaticAsset(request) {
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.url.includes('/_next/static/') ||
    request.url.includes('/static/') ||
    request.url.includes('/fonts/') ||
    request.url.includes('/images/')
  );
}

// Helper function to check if request is for critical resources
function isCriticalResource(request) {
  return (
    request.url.includes('/favicon.ico') ||
    request.url.includes('/manifest.json')
  );
}

// Helper function to check if request is for API
function isAPIRequest(request) {
  return (
    request.url.includes('/api/')
  );
}

// Cache first strategy - good for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Stale while revalidate strategy - good for critical resources
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Start fetch in background
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });

    // Return cached version immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }

    // Otherwise wait for network
    return await fetchPromise;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy - good for API requests and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses for API requests
    if (networkResponse.ok && isAPIRequest(request)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {

    // Fallback to cache for API requests
    if (isAPIRequest(request)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle background sync for analytics and non-critical requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics') {
    event.waitUntil(sendAnalytics());
  }
});

// Function to send queued analytics data
async function sendAnalytics() {
  try {
    // Implement your analytics queue logic here
    console.log('Service Worker: Sending queued analytics data');
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}

// Handle push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/')
  );
});