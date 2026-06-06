// StokSync Service Worker
// Handles push notifications and offline caching

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const { title, body, url, icon, badge } = data

  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: { url: url || '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' },
    ],
    requireInteraction: false,
    tag: 'stoksync-notification',
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Cache app shell for offline use
const CACHE_NAME = 'stoksync-v1'
const CACHE_URLS = ['/', '/dashboard', '/groups', '/contributions', '/payouts']

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.status === 200 && CACHE_URLS.includes(new URL(event.request.url).pathname)) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => cached || new Response('Offline', { status: 503 }))
    })
  )
})
