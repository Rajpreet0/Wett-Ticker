const CACHE_NAME = "wett-ticker-v1"
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"]

// ── Install: cache static assets ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API, cache-first for static ─────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET and cross-origin
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return

  // API requests: network only (no caching)
  if (url.pathname.startsWith("/api/")) return

  // Navigation requests: network-first, fallback to cached "/"
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/").then((r) => r ?? Response.error())
      )
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
    })
  )
})

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      data: { url: data.url || "/" },
      vibrate: [200, 100, 200],
      tag: "wett-ticker",
      renotify: true,
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || "/"

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})
