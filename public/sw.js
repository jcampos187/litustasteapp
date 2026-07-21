// Litus Taste — Service Worker
// Cache name includes a version so we can bust it on updates
const CACHE = "litus-taste-v1";

// ── Install: pre-cache critical assets ─────────────────────────
self.addEventListener("install", (event) => {
  // Pre-cache only assets that exist at build time.
  // /menu and /cart are cached on first visit via the fetch handler.
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        "/",
        "/manifest.json",
        "/icon.svg",
      ]);
    }).catch(() => {
      // Non-fatal: pre-cache may fail if offline during install
      console.warn("SW: pre-cache skipped");
    })
  );
  // Activate immediately without waiting for page refresh
  self.skipWaiting();
});

// ── Activate: clean up old caches ──────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  // Control all clients immediately
  self.clients.claim();
});

// ── Fetch: serve from cache if available, else network with cache fallback ──
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and external requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Serve cached version immediately, then update in background
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE).then((cache) => {
                cache.put(event.request, response);
              });
            }
          })
          .catch(() => {
            // Network failed, cached version is fine
          });
        return cached;
      }

      // Not in cache — fetch from network
      return fetch(event.request).then((response) => {
        // Only cache successful responses for navigation pages
        if (
          response.ok &&
          (event.request.mode === "navigate" ||
            event.request.destination === "style" ||
            event.request.destination === "script" ||
            event.request.destination === "font" ||
            event.request.destination === "image")
        ) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    }).catch(() => {
      // Absolute fallback — show a basic offline page for navigations
      if (event.request.mode === "navigate") {
        return new Response(
          `<!DOCTYPE html>
          <html lang="es">
          <head><meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>Sin conexión — Litus Taste</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FDFBF7; color: #3D3733; text-align: center; padding: 2rem; }
            h1 { font-size: 1.5rem; color: #15803D; }
            p { color: #6B7280; }
            .emoji { font-size: 4rem; margin-bottom: 1rem; }
          </style>
          </head>
          <body>
            <div>
              <div class="emoji">🥗</div>
              <h1>Sin conexión</h1>
              <p>Vuelve a intentar cuando tengas internet.</p>
            </div>
          </body>
          </html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return new Response("Offline", { status: 503 });
    })
  );
});
