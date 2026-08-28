// =============================================
// SERVICE WORKER — Keep The J v2
// =============================================

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
  "/Keep-the-J/icon.jpeg",
  "/Keep-the-J/jeux/points.html",
  "/Keep-the-J/jeux/boite.html",
  "/Keep-the-J/jeux/pictionary.html",
  "/Keep-the-J/jeux/questions.html",
  "/Keep-the-J/jeux/calendrier.html",
  "/Keep-the-J/jeux/bereal.html",
  "/Keep-the-J/jeux/concours.html",
  "/Keep-the-J/jeux/carte.html",
  "/Keep-the-J/jeux/profil.html",
  "/Keep-the-J/jeux/humeur.html",
  "/Keep-the-J/jeux/escape.html"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // addAll échoue si un fichier est introuvable — on utilise add individuel pour être robuste
      return Promise.allSettled(FICHIERS.map(f => cache.add(f)));
    })
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
  // Ne pas intercepter Firebase, Google, ni les requêtes non-GET
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("firebase") || e.request.url.includes("google")) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
