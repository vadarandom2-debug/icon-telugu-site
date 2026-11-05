// Offline shell: network-first so new stories show at once, cached copy when offline.
const CACHE = "icon-v4";
const SHELL = ["./", "index.html", "news.css", "shorts.css", "advanced.css", "demo-data.js", "news.js", "advanced.js", "shorts.js",
  "assets/logo-lockup-light.png", "assets/logo-lockup-dark.png", "assets/favicon.svg", "assets/icon-192.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request)));
});
