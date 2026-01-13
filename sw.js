self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open("notes-v1").then((c) => c.addAll([
      "/Notes/",
      "/Notes/index.html",
      "/Notes/manifest.webmanifest",
      "/Notes/sw.js"
    ])).catch(() => {})
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        // Cache same-origin GETs opportunistically
        try {
          const url = new URL(req.url);
          if (req.method === "GET" && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open("notes-v1").then((c) => c.put(req, copy)).catch(() => {});
          }
        } catch (_) {}
        return res;
      }).catch(() => cached);
    })
  );
});
