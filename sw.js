const CACHE = "keep-the-j-v2";

const FICHIERS = [
  "/Keep-the-J/index.html",
  "/Keep-the-J/app.html",
  "/Keep-the-J/style.css",
  "/Keep-the-J/firebase-config.js",
  "/Keep-the-J/auth.js",
  "/Keep-the-J/db.js",
  "/Keep-the-J/favoris.js",
  "/Keep-the-J/manifest.json",
  "/Keep-the-J/jeux/points.html",
  "/Keep-the-J/jeux/boite.html",
  "/Keep-the-J/jeux/pictionary.html",
  "/Keep-the-J/jeux/questions.html",
  "/Keep-the-J/jeux/calendrier.html",
  "/Keep-the-J/jeux/bereal.html",
  "/Keep-the-J/jeux/concours.html",
  "/Keep-the-J/jeux/carte.html",
  "/Keep-the-J/jeux/profil.html",
  "/Keep-the-J/jeux/humeur.html"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FICHIERS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("firebase") || e.request.url.includes("google")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
