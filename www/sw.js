const CACHE_NAME = "american-caffetteria-v35-studio-hd";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/courier.html",
  "/style.css?v=35",
  "/app.js?v=35",
  "/menu_data.js?v=35",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 0. Никогда не перехватываем внутренние ресурсы Capacitor Android / iOS
  if (url.protocol === "capacitor:" || url.protocol === "ionic:" || (url.hostname === "localhost" && !url.port && url.protocol === "https:")) {
    return;
  }

  // 1. Никогда не кешируем API, SSE-поток и не-GET запросы
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin")
  ) {
    return;
  }

  // 2. Network-First для локалхоста, HTML, JS, CSS и обновленных фото блюд
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const isCodeOrMarkup =
    isLocalhost ||
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.searchParams.has("v");

  if (isCodeOrMarkup) {
    event.respondWith(
      fetch(request)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Stale-While-Revalidate для остальных ресурсов
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResp;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
