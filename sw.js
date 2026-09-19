/* One Lick at a Time — service worker (cache-first app shell) */
const CACHE = "olat-v1.1.0";

const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/styles.css",
  "js/licks.js",
  "js/audio.js",
  "js/tab.js",
  "js/app.js",
  "assets/logo.svg",
  "assets/emblem.svg",
  "assets/favicon.svg",
  "assets/favicon-48.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-512.png",
  "assets/apple-touch-icon.png",
  "assets/fonts/anton-latin-400-normal.woff2",
  "assets/fonts/sora-latin-400-normal.woff2",
  "assets/fonts/sora-latin-600-normal.woff2",
  "assets/fonts/sora-latin-700-normal.woff2",
  "assets/fonts/roboto-mono-latin-500-normal.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll is atomic; use individual puts so one missing file can't break install
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          // Runtime-cache same-origin successful responses
          if (res && res.ok && new URL(req.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          // Offline fallback: for navigations, serve the app shell
          if (req.mode === "navigate") return caches.match("index.html");
          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});
