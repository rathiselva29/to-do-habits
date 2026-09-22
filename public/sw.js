// To-Do-Habits Service Worker - Full Offline First & PWA Support
const CACHE_NAME = 'todo-habits-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn('SW: Cache asset warning', asset, e);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip API routes, dev server internal reload endpoints, and non-http schemes
  if (
    !url.protocol.startsWith('http') ||
    url.pathname.startsWith('/api/') || 
    url.pathname.includes('/@vite/') || 
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/@id/')
  ) {
    return;
  }

  // Navigation requests: Network-First with cached index.html fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
          return new Response('<!DOCTYPE html><html><body>Offline</body></html>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Assets (JS, CSS, images, fonts): Cache-First with Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});

// PostMessage handler from main thread to show real notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: options?.icon || '/pwa-192x192.png',
        badge: options?.badge || '/pwa-192x192.png',
        tag: options?.tag || 'daily-habit-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        data: options?.data || { url: '/' },
      })
    );
  }
});

// Web Push handler for background notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'Good morning!',
    body: 'You have habits to complete today.',
  };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Habit Reminder', body: event.data.text() };
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Habit Reminder', {
      body: data.body || 'You have habits to complete today.',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'daily-habit-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: '/' },
    })
  );
});
