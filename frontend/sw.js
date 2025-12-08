// Service Worker for Suraksha Sathi - Offline First
const CACHE_NAME = 'suraksha-sathi-v1';
const RUNTIME_CACHE = 'suraksha-runtime-v1';
const API_CACHE = 'suraksha-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './api.client.js',
  './features_pages/updated-home-page.html',
  './features_pages/report.html',
  './features_pages/attendance.html',
  './features_pages/checklist.html',
  './features_pages/map.html',
  './features_pages/profile_setting.html',
  './features_pages/video_library.html',
  './features_pages/shorts.html',
  './features_pages/leaderboard.html',
  './features_pages/language-toggle.js',
  './admin/admin-home.html',
  './admin/activity_admin.html',
  './admin/attendance_admin_payroll.html',
  './admin/hazard_nav_admin.html',
  './admin/profile_setting.html',
  './admin/task.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network first, fallback to cache
  if (url.origin.includes('mining-project.onrender.com') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Static assets - Cache first, fallback to network
  else if (request.method === 'GET') {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Non-GET requests (POST, PUT, DELETE) - Network only (will be queued by api.client.js if offline)
  else {
    event.respondWith(fetch(request));
  }
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.match('./index.html');
      if (cache) return cache;
    }
    
    throw error;
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (request.method === 'GET' && networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a custom offline response for API calls
    return new Response(
      JSON.stringify({
        success: false,
        message: 'You are offline. This request will be queued and sent when you are back online.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background Sync - sync queued requests when online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-offline-requests') {
    event.waitUntil(syncOfflineRequests());
  }
});

async function syncOfflineRequests() {
  try {
    // Notify all clients to process their offline queues
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_OFFLINE_QUEUE'
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Message handler for communication with clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Suraksha Sathi';
  const options = {
    body: data.body || 'New notification',
    icon: './mine logo.png',
    badge: './mine logo.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || './index.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
